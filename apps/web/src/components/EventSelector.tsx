'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from '@cms/ui';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  image?: string;
  attendeesCount: number;
  status: string;
  createdAt: string;
}

interface EventSelectorProps {
  selectedEventIds: string[];
  onEventsSelect: (eventIds: string[]) => void;
  title?: string;
  maxSelection?: number;
}

export default function EventSelector({
  selectedEventIds,
  onEventsSelect,
  title = 'Chọn Sự Kiện',
  maxSelection = 10
}: EventSelectorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Events API Response:', data);
        
        // Handle different response formats
        if (data && Array.isArray(data.data)) {
          // Handle paginated response format: { data: [...] }
          setEvents(data.data);
        } else if (Array.isArray(data)) {
          // Handle direct array response
          setEvents(data);
        } else {
          console.warn('Events API returned unexpected format:', data);
          setEvents([]);
        }
      } else {
        console.error('Events API Error:', response.status, response.statusText);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events based on search
  useEffect(() => {
    // Ensure events is always an array
    const eventsArray = Array.isArray(events) ? events : [];
    let filtered = eventsArray;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event && event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  // Fetch selected events details
  useEffect(() => {
    const fetchSelectedEvents = async () => {
      if (selectedEventIds.length === 0) {
        setSelectedEvents([]);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        const promises = selectedEventIds.map(id =>
          fetch(`http://localhost:3001/events/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : null)
        );
        
        const results = await Promise.all(promises);
        const validEvents = results.filter(event => event !== null);
        setSelectedEvents(validEvents);
      } catch (error) {
        console.error('Error fetching selected events:', error);
      }
    };

    fetchSelectedEvents();
  }, [selectedEventIds]);

  // Fetch events when dialog opens
  useEffect(() => {
    if (showDialog) {
      fetchEvents();
    }
  }, [showDialog]);

  const handleToggleEvent = (event: Event) => {
    const isSelected = selectedEventIds.includes(event.id);
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedEventIds.filter(id => id !== event.id);
    } else {
      if (selectedEventIds.length >= maxSelection) {
        alert(`Chỉ có thể chọn tối đa ${maxSelection} sự kiện`);
        return;
      }
      newSelectedIds = [...selectedEventIds, event.id];
    }

    onEventsSelect(newSelectedIds);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'ONGOING': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'Sắp diễn ra';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (!isMounted) return null;

  const dialogContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDialog(false)}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={() => setShowDialog(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="🔍 Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {selectedEventIds.length} / {maxSelection} đã chọn
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">⏳ Đang tải danh sách sự kiện...</div>
            </div>
          ) : !Array.isArray(filteredEvents) || filteredEvents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <div>
                  {searchTerm 
                    ? 'Không tìm thấy sự kiện phù hợp' 
                    : 'Chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!'
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(filteredEvents) && filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                    selectedEventIds.includes(event.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggleEvent(event)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg">{event.title}</h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {getStatusText(event.status)}
                          </span>
                          {selectedEventIds.includes(event.id) && (
                            <div className="text-blue-600 text-lg">✓</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>👥</span>
                          <span>{event.attendeesCount} người tham gia</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => setShowDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Xong
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Selected Events Display */}
      {selectedEvents.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Sự kiện đã chọn:</label>
          <div className="space-y-2">
            {selectedEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">
                    📅 {formatDate(event.startDate)} • 👥 {event.attendeesCount} người tham gia
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const newIds = selectedEventIds.filter(id => id !== event.id);
                    onEventsSelect(newIds);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                >
                  ❌ Bỏ chọn
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Select Button */}
      <Button
        onClick={() => setShowDialog(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        📅 Chọn sự kiện ({selectedEventIds.length}/{maxSelection})
      </Button>

      {/* Dialog */}
      {showDialog && createPortal(dialogContent, document.body)}
    </div>
  );
}

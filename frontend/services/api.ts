const API_BASE_URL = 'http://localhost:5000/api';
export const createMeeting = async (meetingData) => {
  const response = await fetch(`${API_BASE_URL}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meetingData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create meeting');
  }
  return response.json();
};

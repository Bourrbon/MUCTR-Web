export const fetchRandomAvatar = async () => {
  try {
    const response = await fetch('https://randomuser.me/api/');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.results[0].picture.large;
  } catch (error) {
    console.error('Avatar fetch error:', error);
    return '';
  }
};

export const fetchWeather = async () => {
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current=temperature_2m,weathercode'
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error(`Weather API fetch error: ${error.message}`);
  }
};

export const saveBlockToServer = async (block) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: block.type,
        body: JSON.stringify(block.data),
        userId: 1,
      }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const serverData = await response.json();
    block.serverId = serverData.id;
  } catch (error) {
    console.error(`Error saving block ${block.id} to server:`, error);
  }
};
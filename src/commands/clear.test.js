const { clearCommand } = require('./clear');
const storage = require('../storage');

jest.mock('../storage');
jest.mock('readline');

const readline = require('readline');

describe('clearCommand', () => {
  const mockQueue = [
    { id: 'abc123', url: 'https://example.com', tags: [], addedAt: '2024-01-01T00:00:00.000Z' },
    { id: 'def456', url: 'https://github.com', tags: [], addedAt: '2024-01-02T00:00:00.000Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    storage.loadQueue.mockResolvedValue([...mockQueue]);
    storage.saveQueue.mockResolvedValue(undefined);
  });

  it('clears queue without prompt when --force is set', async () => {
    await clearCommand({ force: true });
    expect(storage.saveQueue).toHaveBeenCalledWith([]);
  });

  it('logs how many entries were cleared', async () => {
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    await clearCommand({ force: true });
    expect(mockLog).toHaveBeenCalledWith('Cleared 2 entries from the queue.');
    mockLog.mockRestore();
  });

  it('logs message when queue is already empty', async () => {
    storage.loadQueue.mockResolvedValue([]);
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    await clearCommand({ force: true });
    expect(storage.saveQueue).not.toHaveBeenCalled();
    expect(mockLog).toHaveBeenCalledWith('Queue is already empty.');
    mockLog.mockRestore();
  });

  it('aborts when user does not confirm', async () => {
    readline.createInterface.mockReturnValue({
      question: (q, cb) => cb('n'),
      close: jest.fn(),
    });
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    await clearCommand({});
    expect(storage.saveQueue).not.toHaveBeenCalled();
    expect(mockLog).toHaveBeenCalledWith('Aborted.');
    mockLog.mockRestore();
  });
});

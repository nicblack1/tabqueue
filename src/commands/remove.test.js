const { removeCommand } = require('./remove');
const storage = require('../storage');

jest.mock('../storage');

describe('removeCommand', () => {
  const mockQueue = [
    { id: 'abc123', url: 'https://example.com', tags: ['work'], addedAt: '2024-01-01T00:00:00.000Z' },
    { id: 'def456', url: 'https://github.com/foo/bar', tags: [], addedAt: '2024-01-02T00:00:00.000Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    storage.loadQueue.mockResolvedValue([...mockQueue]);
    storage.removeEntry.mockResolvedValue(undefined);
  });

  it('removes entry by exact URL', async () => {
    await removeCommand('https://example.com');
    expect(storage.removeEntry).toHaveBeenCalledWith('abc123');
  });

  it('removes entry by partial URL match', async () => {
    await removeCommand('github.com');
    expect(storage.removeEntry).toHaveBeenCalledWith('def456');
  });

  it('removes entry by id when --id flag is set', async () => {
    await removeCommand('abc123', { id: true });
    expect(storage.removeEntry).toHaveBeenCalledWith('abc123');
  });

  it('exits with error when entry not found', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await removeCommand('https://notfound.com');

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
    mockError.mockRestore();
  });

  it('logs message when queue is empty', async () => {
    storage.loadQueue.mockResolvedValue([]);
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    await removeCommand('https://example.com');

    expect(mockLog).toHaveBeenCalledWith('Queue is empty. Nothing to remove.');
    expect(storage.removeEntry).not.toHaveBeenCalled();
    mockLog.mockRestore();
  });
});

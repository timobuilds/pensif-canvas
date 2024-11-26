export interface UserPresence {
  id: string;
  name: string;
  cursor: { x: number; y: number };
  lastSeen: Date;
}

export class PresenceManager {
  private users: Map<string, UserPresence> = new Map();
  private updateCallback: (users: UserPresence[]) => void;
  private projectId: string;

  constructor(projectId: string, updateCallback: (users: UserPresence[]) => void) {
    this.projectId = projectId;
    this.updateCallback = updateCallback;
    // TODO: Implement real-time presence with Pusher
  }

  updatePresence(userId: string, presence: Partial<UserPresence>) {
    const existingUser = this.users.get(userId);
    const updatedUser = {
      ...existingUser,
      ...presence,
      lastSeen: new Date(),
    } as UserPresence;

    this.users.set(userId, updatedUser);
    this.notifyUpdate();
  }

  private notifyUpdate() {
    this.updateCallback(Array.from(this.users.values()));
  }

  disconnect() {
    // TODO: Implement cleanup when real-time is added
  }
}

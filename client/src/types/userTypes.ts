export interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    telnumber: string;
    passwordHash: string;
    households: Record<string, 'owner' | 'member'>;
  }
  
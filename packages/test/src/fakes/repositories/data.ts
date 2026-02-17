import type { User } from '@/types/user'

export class Data {
  public items: {
    users: User[]
  }

  constructor() {
    this.items = {
      users: [],
    }
  }
}

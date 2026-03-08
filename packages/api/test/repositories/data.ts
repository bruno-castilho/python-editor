import type { User } from '../../src/repositories/types/user'

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

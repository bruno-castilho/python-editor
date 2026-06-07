import type { User } from '../../src/domain/types/user'

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

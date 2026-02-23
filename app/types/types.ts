export interface MenuItem {
  id: number
  documentId: string
  Name: string
  Price: number
  Category: string
}

export interface Order {
  id: number
  tableNumber: number
  status: string
  items: {
    id: number
    Name: string
    Price: number
  }[]
}
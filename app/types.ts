export interface MenuItem {
    id: string
    name: string
    menuId: string
    parentId: string | null
    depth: number
    order: number
    children: MenuItem[]
  }
  
  export interface Menu {
    id: string
    name: string
    items: MenuItem[]
  }
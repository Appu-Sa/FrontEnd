import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Menu, MenuItem } from '@/app/types'

interface MenuState {
  menus: Menu[]
  loading: boolean
  error: string | null
}

const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null,
}

export const fetchMenus = createAsyncThunk('menu/fetchMenus', async () => {
  const response = await fetch('http://localhost:3001/menus')
  if (!response.ok) throw new Error('Failed to fetch menus')
  return response.json()
})

export const createMenu = createAsyncThunk('menu/createMenu', async (menuData: { name: string }) => {
  const response = await fetch('http://localhost:3001/menus/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuData),
  })
  if (!response.ok) throw new Error('Failed to create menu')
  return response.json()
})

export const addMenuItem = createAsyncThunk('menu/addMenuItem', async (itemData: Omit<MenuItem, 'id' | 'children'>) => {
  const response = await fetch('http://localhost:3001/menus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  })
  if (!response.ok) throw new Error('Failed to add menu item')
  return response.json()
})

export const updateMenuItem = createAsyncThunk('menu/updateMenuItem', async ({ id, name }: { id: string, name: string }) => {
  const response = await fetch(`http://localhost:3001/menus/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error('Failed to update menu item')
  return response.json()
})

export const deleteMenuItem = createAsyncThunk('menu/deleteMenuItem', async (id: string) => {
  const response = await fetch(`http://localhost:3001/menus/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete menu item')
  return id
})

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenus.fulfilled, (state, action: PayloadAction<Menu[]>) => {
        state.loading = false
        state.menus = action.payload
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch menus'
        state.menus = [] // Ensure menus is an empty array when fetch fails
      })
      .addCase(createMenu.fulfilled, (state, action: PayloadAction<Menu>) => {
        state.menus.push(action.payload)
      })
      .addCase(addMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        const { menuId, parentId } = action.payload
        const menu = state.menus.find(m => m.id === menuId)
        if (menu) {
          const addToChildren = (items: MenuItem[]): boolean => {
            for (const item of items) {
              if (item.id === parentId) {
                if (!item.children) item.children = [];
                item.children.push(action.payload)
                return true
              }
              if (item.children && addToChildren(item.children)) {
                return true
              }
            }
            return false
          }
          
          if (parentId) {
            addToChildren(menu.items)
          } else {
            menu.items.push(action.payload)
          }
        }
      })
      .addCase(updateMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        const updateItem = (items: MenuItem[]) => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].id === action.payload.id) {
              items[i] = { ...items[i], ...action.payload }
              return true
            }
            if (items[i].children && updateItem(items[i].children)) {
              return true
            }
          }
          return false
        }
        state.menus.forEach(menu => updateItem(menu.items))
      })
      .addCase(deleteMenuItem.fulfilled, (state, action: PayloadAction<string>) => {
        const deleteItem = (items: MenuItem[]): MenuItem[] => {
          return items.filter(item => {
            if (item.id === action.payload) {
              return false
            }
            if (item.children) {
              item.children = deleteItem(item.children)
            }
            return true
          })
        }
        state.menus.forEach(menu => {
          menu.items = deleteItem(menu.items)
        })
      })
      
  },
})

export default menuSlice.reducer
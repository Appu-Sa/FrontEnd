import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { MenuItem as MenuItemType } from '@/app/types'
import { updateMenuItem, deleteMenuItem, addMenuItem } from '../lib/menuSlice'
import { AppDispatch } from '../lib/store'

type MenuItemProps = {
  item: MenuItemType
  depth: number
}

export default function MenuItem({ item, depth }: MenuItemProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(item.name)

  const handleUpdate = () => {
    dispatch(updateMenuItem({ id: item.id, name }))
    setIsEditing(false)
  }

  const handleDelete = () => {
    dispatch(deleteMenuItem(item.id))
  }

  const handleAddChild = () => {
    dispatch(addMenuItem({ name: 'New Item', parentId: item.id, menuId: item.menuId, depth: depth + 1, order: item.children.length }))
  }

  return (
    <li className="mb-2">
      <div className="flex items-center">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-2 py-1 mr-2"
          />
        ) : (
          <span className="mr-2">{item.name}</span>
        )}
        {isEditing ? (
          <button onClick={handleUpdate} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
        )}
        <button onClick={handleDelete} className="bg-red-500 text-white px-2 py-1 rounded mr-2">Delete</button>
        <button onClick={handleAddChild} className="bg-purple-500 text-white px-2 py-1 rounded">Add Child</button>
      </div>
      {item.children && item.children.length > 0 && (
        <ul className="pl-4 mt-2">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
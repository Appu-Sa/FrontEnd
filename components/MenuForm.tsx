import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createMenu } from '../lib/menuSlice'
import { AppDispatch } from '../lib/store'

export default function MenuForm() {
  const dispatch = useDispatch<AppDispatch>()
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(createMenu({ name }))
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create New Menu</h2>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-2">Menu Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Menu</button>
    </form>
  )
}
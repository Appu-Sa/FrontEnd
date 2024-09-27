import { Menu } from '@/app/types'
import MenuItem from './MenuItem'

type MenuListProps = {
  menus: Menu[] | undefined
}

export default function MenuList({ menus }: MenuListProps) {
  if (!menus || menus.length === 0) {
    return <div>No menus available.</div>
  }

  return (
    <div>
      {menus.map((menu) => (
        <div key={menu.id} className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{menu.name}</h2>
          <ul className="pl-4">
            {menu.items && menu.items.length > 0 ? (
              menu.items.map((item) => (
                <MenuItem key={item.id} item={item} depth={0} />
              ))
            ) : (
              <li>No items in this menu.</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  )
}
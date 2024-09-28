"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMenus,
  createMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../lib/menuSlice";
import { AppDispatch, RootState } from "../lib/store";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Edit,
  Menu as MenuIcon,
  X,
  File,
  Folder,
} from "lucide-react";
import Image from "next/image";
import { Menu, MenuItem } from "@/app/types";
import Logo from "./assests/logo.svg";
import submenu from "./assests/submenu.svg";
import submenu1 from "./assests/submenu1.svg";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  menus: Menu[];
  loading: boolean;
  error: string | null;
  selectedMenu: string;
  onMenuSelect: (menuId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  menus,
  loading,
  error,
  selectedMenu,
  onMenuSelect,
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string>("");

  const handleMSelectItem = useCallback((itemId: string) => {
    setSelected(itemId);
  }, []);

  const toggleMenu = useCallback((menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  }, []);

  return (
    <div
      className={`bg-[#101828] text-white h-[750px] fixed rounded-xl left-0 top-0 w-64 transform m-0 md:m-5  ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-30 md:translate-x-0 overflow-y-auto`}
    >
      <div className="p-4">
        <div className="flex justify-between h-[84px] items-center mb-8">
          <Image src={Logo} alt="CLOIT" width={70} height={24} />
          <button onClick={onClose} className="text-white">
            <MenuIcon size={24} />
          </button>
        </div>
        <div className=" py-[10px] px-[2px] ">
          <ul>
            {loading ? (
              <li className="text-gray-400">Loading menus...</li>
            ) : error ? (
              <li className="text-red-500">Error: {error}</li>
            ) : (
              menus.map((menu) => (
                <li key={menu.id}>
                  <div
                    key={menu.id}
                    className={`${
                      expandedMenus.has(menu.id) ? "bg-[#1D2939]" : ""
                    } p-2 mb-2 rounded-lg`}
                  >
                    <button
                      onClick={() => toggleMenu(menu.id)}
                      className={`flex items-center justify-between w-full text-left ${
                        expandedMenus.has(menu.id)
                          ? "text-white"
                          : "text-gray-400"
                      } hover:text-white`}
                    >
                      <div className="flex w-full items-center gap-3">
                        <Folder
                          size={24}
                          className={`${
                            expandedMenus.has(menu.id) ? "fill-white" : ""
                          }`}
                        />
                        <p className=" text-xl ">{menu.name}</p>
                      </div>
                    </button>
                    {expandedMenus.has(menu.id) && menu.items && (
                      <ul className="mt-2 gap-2">
                        {menu.items
                          .filter((item) => !item.parentId)
                          .map((item) => (
                            <li key={item.id} className="mt-1">
                              <button
                                className={`text-gray-400  ${
                                  selected === item.id
                                    ? "text-black text-left bg-[#9FF443] p-2 rounded-2xl w-full"
                                    : "hover:text-white"
                                }`}
                                onClick={() => {
                                  onMenuSelect(menu.id);
                                  handleMSelectItem(item.id);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={submenu}
                                    alt="sumenu"
                                    className={`${
                                      selected === item.id ? " fill-black" : ""
                                    }`}
                                  />
                                  <p className=" text-lg ">{item.name}</p>
                                </div>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

interface MenuTreeProps {
  menu: Menu;
  onAddItem: (parentId: string | null) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
}

const MenuTree: React.FC<MenuTreeProps> = React.memo(
  ({ menu, onAddItem, onEditItem, onDeleteItem }) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [menuStructure, setMenuStructure] = useState<Menu>(menu);

    useEffect(() => {
      const rebuildMenuStructure = (items: MenuItem[]): MenuItem[] => {
        const itemMap = new Map<string, MenuItem>();
        const rootItems: MenuItem[] = [];

        // First pass: create a map of all items
        items.forEach(item => {
          itemMap.set(item.id, { ...item, children: [] });
        });

        // Second pass: build the tree structure
        items.forEach(item => {
          const currentItem = itemMap.get(item.id)!;
          if (item.parentId === null) {
            rootItems.push(currentItem);
          } else {
            const parentItem = itemMap.get(item.parentId);
            if (parentItem) {
              parentItem.children.push(currentItem);
            } else {
              // If parent is not found, treat as root item
              rootItems.push(currentItem);
            }
          }
        });

        return rootItems;
      };

      setMenuStructure({
        ...menu,
        items: rebuildMenuStructure(menu.items)
      });
    }, [menu]);

    const toggleExpand = useCallback((id: string) => {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
    }, []);

    const expandAll = useCallback(() => {
      const allIds = new Set([menuStructure.id]);
      const collectIds = (items: MenuItem[]) => {
        items.forEach((item) => {
          allIds.add(item.id);
          if (item.children.length > 0) collectIds(item.children);
        });
      };
      collectIds(menuStructure.items);
      setExpandedItems(allIds);
    }, [menuStructure]);

    const collapseAll = useCallback(() => {
      setExpandedItems(new Set());
    }, []);

    const renderMenuItem = useCallback(
      (item: MenuItem | Menu, depth = 0, isLast = false) => {
        const isExpanded = expandedItems.has(item.id);
        const isRootItem = depth === 0;
        const itemAsMenuItem = isRootItem
          ? {
              ...item,
              menuId: (item as Menu).id,
              parentId: null,
              depth: 0,
              order: 0,
              children: (item as Menu).items
            } as MenuItem
          : item as MenuItem;

        return (
          <div
            key={item.id}
            className={`my-1 relative ${isLast ? "last-child" : ""}`}
          >
            <div
              className="flex items-center relative"
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {depth > 0 && (
                <>
                  <div
                    className="absolute left-0 top-1/2 w-5 h-[1px] bg-gray-300"
                    style={{ left: `${(depth - 1) * 20}px` }}
                  ></div>
                  <div
                    className="absolute left-0 top-0 w-[1px] h-full bg-gray-300"
                    style={{ left: `${(depth - 1) * 20}px` }}
                  ></div>
                </>
              )}
              {(isRootItem || itemAsMenuItem.children.length > 0) && (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="mr-2 relative z-10"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
              <span
                className="cursor-pointer relative z-10"
                onClick={() => onEditItem(itemAsMenuItem)}
              >
                {item.name}
              </span>
              <button
                onClick={() => onAddItem(item.id)}
                className="ml-2 text-blue-500 relative z-10"
              >
                <Plus size={16} />
              </button>
              {depth > 0 && (
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="ml-2 text-red-500 relative z-10"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {isExpanded && itemAsMenuItem.children.length > 0 && (
              <div className="ml-4 relative">
                {itemAsMenuItem.children.map((child, index) =>
                  renderMenuItem(
                    child,
                    depth + 1,
                    index === itemAsMenuItem.children.length - 1
                  )
                )}
              </div>
            )}
          </div>
        );
      },
      [expandedItems, onAddItem, onEditItem, onDeleteItem, toggleExpand]
    );

    return (
      <div className="bg-white p-4 rounded-lg">
        <div className="flex justify-between w-[282px] mb-4">
          <button
            onClick={expandAll}
            className={`max-w-[133px] w-full px-4 py-2 rounded-[48px] ${
              expandedItems.size > 0
                ? "bg-[#1D2939] text-white"
                : "bg-[#D0D5DD] text-black"
            }`}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className={`max-w-[133px] w-full px-4 py-2 rounded-[48px] ${
              expandedItems.size === 0
                ? "bg-[#1D2939] text-white"
                : "bg-[#D0D5DD] text-black"
            }`}
          >
            Collapse All
          </button>
        </div>
        {renderMenuItem(menuStructure)}
      </div>
    );
  }
);

interface MenuItemDetailsProps {
  item: MenuItem;
  onUpdate: (updatedItem: MenuItem) => void;
  onClose: () => void;
  getParentName: (parentId: string | null) => string;
}

const MenuItemDetails: React.FC<MenuItemDetailsProps> = ({
  item,
  onUpdate,
  onClose,
  getParentName,
}) => {
  const [name, setName] = useState(item.name);
  const [parentName, setParentName] = useState("");

  useEffect(() => {
    // Update all state values when the item prop changes
    setName(item.name);
    setParentName(getParentName(item.parentId));
  }, [item, getParentName]);

  const handleSave = () => {
    onUpdate({ ...item, name });
  };

  return (
    <div className="bg-white w-full p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#475467] mb-1">
          MenuID
        </label>
        <div className="bg-gray-100 px-4 py-4 h-[52px] rounded-[16px] text-sm">
          {item.menuId}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#475467] mb-1">
          Depth
        </label>
        <div className="bg-[#EAECF0] px-4 py-4 h-[52px] w-[262px] rounded-[16px] text-sm">
          {item.depth}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#475467] mb-1">
          Parent Data
        </label>
        <div className=" px-4 py-4 bg-[#F9FAFB] w-[262px] rounded-[16px] h-[52px] text-sm">
          {parentName}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#475467] mb-1">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 h-[52px] bg-[#F9FAFB] w-[262px] rounded-[16px] text-sm focus:outline-none"
        />
      </div>
      <button
        onClick={handleSave}
        className="w-[263px] h-[52px] text-[14px] px-4 py-2 bg-blue-600 text-white  rounded-[48px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save
      </button>
    </div>
  );
};

export default function MenuManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { menus, loading, error } = useSelector((state: RootState) => state.menu);
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);
  const handleMenuSelect = useCallback((menuId: string) => {
    setSelectedMenu(menuId);
  }, []);

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const handleAddItem = useCallback((parentId: string | null) => {
    setIsAddingItem(true);
    setSelectedItem(parentId ? findItemById(menus, parentId) : null);
  }, [menus]);

  const handleAddItemSubmit = useCallback(async () => {
    if (newItemName.trim() && selectedMenu) {
      const menuId = selectedMenu;
      const depth = selectedItem ? selectedItem.depth + 1 : 0;
      const newItem = {
        name: newItemName,
        parentId: selectedItem ? selectedItem.id : null,
        menuId,
        depth,
        order: 0,
      };
      
      try {
        await dispatch(addMenuItem(newItem)).unwrap();
        // Refetch the menus to get the updated state
        dispatch(fetchMenus());
        setNewItemName("");
        setIsAddingItem(false);
      } catch (error) {
        console.error("Failed to add menu item:", error);
      }
    }
  }, [dispatch, newItemName, selectedMenu, selectedItem]);

  const handleUpdateItem = useCallback((updatedItem: MenuItem) => {
    dispatch(updateMenuItem({ id: updatedItem.id, name: updatedItem.name }));
  }, [dispatch]);

  const handleDeleteItem = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteMenuItem(id));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
    }
  }, [dispatch, selectedItem]);

  const getParentName = useCallback((parentId: string | null) => {
    if (!parentId) return 'Root';
    const item = findItemById(menus, parentId);
    return item ? item.name : 'Unknown';
  }, [menus]);

  const findItemById = (menus: Menu[], id: string): MenuItem | null => {
    for (const menu of menus) {
      const found = findItemInTree(menu.items, id);
      if (found) return found;
    }
    return null;
  };

  const findItemInTree = (items: MenuItem[], id: string): MenuItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemInTree(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        menus={menus}
        loading={loading}
        error={error}
        selectedMenu={selectedMenu}
        onMenuSelect={handleMenuSelect}
      />
      <div className="flex-1 w-full bg-white pt-4">
        <div className="bg-white shadow-md p-4 flex justify-between items-center md:hidden">
          <button onClick={toggleSidebar} className="text-gray-600">
            <MenuIcon size={24} />
          </button>
          <div className="w-6"></div>
        </div>
        <div className="md:ml-64 py-4 px-12">
          <span className="flex items-center gap-2">
            <Folder size={16} fill="#D0D5DD" stroke="0" />
            <span className="text-[#D0D5DD]">/</span>
            <span className="text-sm text-[#101828] font-sans">Menus</span>
          </span>
        </div>
        <div className="h-20 md:ml-64 py-4 px-12">
          <span className="flex items-center gap-3">
            <div className="h-[52px] w-[52px] rounded-full bg-[#253BFF] relative">
              <Image
                src={submenu1}
                alt="submenu"
                className="absolute object-cover left-[13px] top-[13px] w-6 h-6"
              />
            </div>
            <h4 className="text-[32px] text-[#101828] font-bold font-sans">
              Menus
            </h4>
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:ml-64 px-12">
          <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-4 md:mb-0">
          {/* <div className="mb-4 flex">
                <input
                  type="text"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="New Menu Name"
                  className="flex-grow bg-white text-gray-900 px-4 py-2 rounded-l"
                />
                <button
                  onClick={handleCreateMenu}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                  Create Menu
                </button>
              </div> */}
            <div className="flex flex-col gap-1">
              <p className="text-[14px]">Menu</p>
              <div className="relative w-full md:w-[349px]">
                <select
                  value={selectedMenu}
                  onChange={(e) => setSelectedMenu(e.target.value)}
                  className="appearance-none w-full px-4 py-[14px] bg-[#F9FAFB] text-gray-900 rounded-2xl outline-none"
                >
                  <option value="">Select a menu</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-8">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 pr-0 mb-4 md:mb-0">
              {selectedMenu && (
                <MenuTree
                  menu={menus.find(m => m.id === selectedMenu)!}
                  onAddItem={handleAddItem}
                  onEditItem={setSelectedItem}
                  onDeleteItem={handleDeleteItem}
                />
              )}
            </div>
          </div>
        </div>
          </div>
          <div className="w-full md:w-1/2">
            {selectedItem && !isAddingItem && (
              <MenuItemDetails
                item={selectedItem}
                onUpdate={handleUpdateItem}
                onClose={() => setSelectedItem(null)}
                getParentName={getParentName}
              />
            )}
            <div className="w-full">
              {isAddingItem && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">
                    Add New Menu Item
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={handleAddItemSubmit}
                      className="bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Item
                    </button>
                    <button
                      onClick={() => setIsAddingItem(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
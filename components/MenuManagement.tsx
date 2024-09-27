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
} from "lucide-react";
import { debounce } from "lodash";
import Image from "next/image";
import { Menu, MenuItem } from "@/app/types";

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
      className={`bg-[#1B1C31] text-white h-screen fixed left-0 top-0 w-64 transform m-5  ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-30 md:translate-x-0 overflow-y-auto`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-8">
          <Image
            src="/path-to-your-logo.png"
            alt="CLOIT"
            width={100}
            height={30}
          />
          <button onClick={onClose} className="text-white md:hidden">
            <X size={24} />
          </button>
        </div>
        <ul>
          {loading ? (
            <li className="text-gray-400">Loading menus...</li>
          ) : error ? (
            <li className="text-red-500">Error: {error}</li>
          ) : (
            menus.map((menu) => (
              <li key={menu.id} className="mb-4">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`flex items-center justify-between w-full text-left ${
                    selectedMenu === menu.id ? "text-white" : "text-gray-400"
                  } hover:text-white`}
                >
                  <span className="flex items-center gap-2">
                    <MenuIcon />
                    {menu.name}
                  </span>
                  {expandedMenus.has(menu.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                {expandedMenus.has(menu.id) && menu.items && (
                  <ul className="mt-2">
                    {menu.items
                      .filter((item) => !item.parentId)
                      .map((item) => (
                        <li key={item.id} className="mt-1">
                          <button
                            className={`text-gray-400 hover:text-white ${
                              selectedMenu === menu.id
                                ? "text-white text-left bg-[#4318FF] p-2 rounded-lg w-full"
                                : ""
                            }`}
                            onClick={() => onMenuSelect(menu.id)}
                          >
                            <span className="flex items-center gap-2">
                              <MenuIcon />
                              {item.name}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))
          )}
        </ul>
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

    const toggleExpand = useCallback((id: string) => {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
    }, []);

    const renderMenuItem = useCallback(
      (item: MenuItem, depth = 0) => {
        const isExpanded = expandedItems.has(item.id);
        return (
          <div key={item.id} className="my-1">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {item.children && item.children.length > 0 && (
                <button onClick={() => toggleExpand(item.id)} className="mr-2">
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
              <span className="cursor-pointer" onClick={() => onEditItem(item)}>
                {item.name}
              </span>
              <button
                onClick={() => onAddItem(item.id)}
                className="ml-2 text-blue-500"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="ml-2 text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
            {isExpanded && item.children && (
              <div className="ml-4">
                {item.children.map((child) => renderMenuItem(child, depth + 1))}
              </div>
            )}
          </div>
        );
      },
      [expandedItems, onAddItem, onEditItem, onDeleteItem, toggleExpand]
    );

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">{menu.name}</h3>
        <div className="flex mb-4">
          <button
            onClick={() =>
              setExpandedItems(new Set(menu.items.map((item) => item.id)))
            }
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedItems(new Set())}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Collapse All
          </button>
        </div>
        <button onClick={() => toggleExpand(menu.id)}>
          <span className="flex items-center">
            {expandedItems.has(menu.id) ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            {menu.name}
            <button
              onClick={() => onAddItem(menu.id)}
              className="ml-2 text-blue-500"
            >
              <Plus size={16} />
            </button>
          </span>
        </button>
        {expandedItems.has(menu.id) &&
          menu.items &&
          menu.items
            .filter((item) => !item.parentId)
            .map((item) => renderMenuItem(item))}
      </div>
    );
  }
);

const MenuItemDetails = React.memo(
  ({
    item,
    onUpdate,
    onClose,
  }: {
    item: MenuItem;
    onUpdate: (updatedItem: MenuItem) => void;
    onClose: () => void;
  }) => {
    const [name, setName] = useState(item.name);

    const debouncedUpdate = useMemo(
      () =>
        debounce((updatedItem: MenuItem) => {
          onUpdate(updatedItem);
        }, 300),
      [onUpdate]
    );

    useEffect(() => {
      if (name !== item.name) {
        debouncedUpdate({ ...item, name });
      }
      return () => {
        debouncedUpdate.cancel();
      };
    }, [name, item, debouncedUpdate]);

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Menu Item Details</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            MenuID
          </label>
          <input
            type="text"
            value={item.menuId}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Depth
          </label>
          <input
            type="text"
            value={item.depth}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Parent Data
          </label>
          <input
            type="text"
            value={item.parentId || "None"}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
);

export default function MenuManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { menus, loading, error } = useSelector(
    (state: RootState) => state.menu
  );
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [newMenuName, setNewMenuName] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCreateMenu = useCallback(() => {
    if (newMenuName.trim()) {
      dispatch(createMenu({ name: newMenuName }));
      setNewMenuName("");
    }
  }, [dispatch, newMenuName]);

  const handleAddItem = useCallback(
    (parentId: string | null) => {
      setIsAddingItem(true);
      setSelectedItem(
        parentId
          ? menus
              .find((m) => m.id === selectedMenu)
              ?.items.find((i) => i.id === parentId) || null
          : null
      );
    },
    [menus, selectedMenu]
  );

  const handleAddItemSubmit = useCallback(() => {
    if (newItemName.trim() && selectedMenu) {
      const menuId = selectedMenu;
      const depth = selectedItem ? selectedItem.depth + 1 : 0;
      dispatch(
        addMenuItem({
          name: newItemName,
          parentId: selectedItem ? selectedItem.id : null,
          menuId,
          depth,
          order: 0,
        })
      );
      setNewItemName("");
      setIsAddingItem(false);
    }
  }, [dispatch, newItemName, selectedMenu, selectedItem]);

  const handleUpdateItem = useCallback(
    (updatedItem: MenuItem) => {
      dispatch(updateMenuItem(updatedItem));
    },
    [dispatch]
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      if (confirm("Are you sure you want to delete this item?")) {
        dispatch(deleteMenuItem(id));
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(null);
        }
      }
    },
    [dispatch, selectedItem]
  );

  const handleMenuSelect = useCallback((menuId: string) => {
    setSelectedMenu(menuId);
  }, []);

  const selectedMenuData = useMemo(
    () => menus.find((menu) => menu.id === selectedMenu),
    [menus, selectedMenu]
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

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
      <div className="flex-1 w-full">
        <div className="bg-white shadow-md p-4 flex justify-between items-center md:hidden">
          <button onClick={toggleSidebar} className="text-gray-600">
            <MenuIcon size={24} />
          </button>
          <h1 className="text-xl font-bold">CLOIT</h1>
          <div className="w-6"></div> {/* Placeholder for balance */}
        </div>
        <div className="p-8 md:ml-64">
          <div className="flex flex-col md:flex-row mb-8">
            <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">Menus</h2>
              <div className="mb-4 flex">
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
              </div>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded"
              >
                <option value="">Select a menu</option>
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/3 pr-0 md:pr-4 mb-4 md:mb-0">
              {selectedMenuData && (
                <MenuTree
                  menu={selectedMenuData}
                  onAddItem={handleAddItem}
                  onEditItem={setSelectedItem}
                  onDeleteItem={handleDeleteItem}
                />
              )}
            </div>
            <div className="w-full md:w-1/3">
              {selectedItem && !isAddingItem && (
                <MenuItemDetails
                  item={selectedItem}
                  onUpdate={handleUpdateItem}
                  onClose={() => setSelectedItem(null)}
                />
              )}
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

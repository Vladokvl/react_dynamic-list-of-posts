import React, { useEffect, useRef, useState } from 'react';
import { User } from '../types/User';
import { client } from '../utils/fetchClient';

export const UserSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([] as User[]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    client.get<User[]>('/users').then((data: User[]) => setUsers(data));
  }, []);

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', onDocumentClick);

    return () => document.removeEventListener('click', onDocumentClick);
  }, []);

  const handleToggle = () => setIsOpen(prev => !prev);

  const handleSelect = (user: User) => {
    const isSame = user.id === selectedUserId;

    setSelectedUserId(user.id);
    setIsOpen(false);

    // Dispatch a custom event so other components may react if needed
    try {
      const ev = new CustomEvent('userSelected', { detail: user });

      document.dispatchEvent(ev);
    } catch (err) {
      // ignore on older browsers in tests
    }

    if (isSame) {
      // If the same user was clicked while open, just close the dropdown
      setIsOpen(false);
    }
  };

  return (
    <div
      data-cy="UserSelector"
      ref={rootRef}
      className={`dropdown ${isOpen ? 'is-active' : ''}`}
    >
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={handleToggle}
        >
          <span>
            {selectedUserId
              ? (users.find(u => u.id === selectedUserId)?.name ??
                'Choose a user')
              : 'Choose a user'}
          </span>

          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {users.map(user => (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              href={`#user-${user.id}`}
              key={user.id}
              className={`dropdown-item ${selectedUserId === user.id ? 'is-active' : ''}`}
              onClick={e => {
                e.preventDefault();
                handleSelect(user);
              }}
            >
              {user.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

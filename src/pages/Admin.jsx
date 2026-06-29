import { useCallback, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import './Admin.css'

export default function Admin() {
  const { user, token, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [creatingUser, setCreatingUser] = useState(false)
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' })

  const [resetPasswordUserId, setResetPasswordUserId] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' })

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    setError(null)

    try {
      const data = await apiRequest('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }, [token])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreatingUser(true)
    setCreateMessage({ type: '', text: '' })

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      setCreateMessage({
        type: 'success',
        text: data.message || `Verification code sent to ${formData.email}.`,
      })
      setFormData({ username: '', email: '', password: '' })
      await loadUsers()
    } catch (err) {
      setCreateMessage({
        type: 'error',
        text: err.message || 'Failed to create user',
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResettingPassword(true)
    setResetMessage({ type: '', text: '' })

    try {
      const data = await apiRequest('/users/reset-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: resetPasswordUserId,
          newPassword,
        }),
      })

      setResetMessage({
        type: 'success',
        text: `Password reset for ${data.user.username} successfully!`,
      })
      setResetPasswordUserId(null)
      setNewPassword('')
      await loadUsers()
    } catch (err) {
      setResetMessage({
        type: 'error',
        text: err.message || 'Failed to reset password',
      })
    } finally {
      setResettingPassword(false)
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user '${username}'? This cannot be undone.`)) {
      return
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const newestUsers = users.slice(0, 4)

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/miitLogo.png" alt="MiitVerse Logo" />

          <div className="admin-logo-text">
            <h2>
              <span className="miit">Miit</span>
              <span className="verse">Verse</span>
            </h2>
            <p>Official Social Hub of MIIT</p>
            <span className="admin-panel">Admin Panel</span>
          </div>
        </div>

        <nav>
          <ul>
            <li className="active">📊 Dashboard</li>
            <li>👥 Users</li>
            <li>📝 Posts</li>
            <li>📅 Events</li>
            <li>🚩 Reports</li>
            <li>⚙️ Settings</li>
          </ul>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Admin</p>
          </div>

          <div className="admin-profile">
            <img src="https://i.pravatar.cc/150?img=8" alt="admin" />
            <span>{user?.username || user?.email}</span>
          </div>
        </div>

        <div className="admin-actions">
          <button className="admin-button" type="button" onClick={loadUsers}>
            Manage Users
          </button>
          <button className="admin-logout" type="button" onClick={logout}>
            Log out
          </button>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>👥 Users</h3>
            <h2>{users.length || 12540}</h2>
            <p>+8% this month</p>
          </div>

          <div className="stat-card">
            <h3>📝 Posts</h3>
            <h2>48,221</h2>
            <p>+15% this month</p>
          </div>

          <div className="stat-card">
            <h3>📅 Events</h3>
            <h2>327</h2>
            <p>+4% this month</p>
          </div>

          <div className="stat-card">
            <h3>🚩 Reports</h3>
            <h2>18</h2>
            <p>Needs review</p>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="activity-card">
            <h2>Recent Activity</h2>
            <div className="activity-item">
              <strong>John Doe</strong> created a new event
            </div>
            <div className="activity-item">
              <strong>Sarah</strong> posted a new update
            </div>
            <div className="activity-item">
              <strong>Michael</strong> reported a post
            </div>
            <div className="activity-item">
              <strong>Emma</strong> joined MiitVerse
            </div>
          </div>

          <div className="users-card">
            <h2>Newest Users</h2>
            {newestUsers.length > 0 ? (
              newestUsers.map((userItem) => (
                <div className="user-row" key={userItem.id}>
                  <span>{userItem.username}</span>
                  <span>{new Date(userItem.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="user-row">
                <span>No users loaded</span>
                <span>—</span>
              </div>
            )}
          </div>
        </section>

        <section className="admin-create-user">
          <div className="admin-create-header">
            <h2>Create New User</h2>
            <p>Add a new user to the system with username, email, and password.</p>
          </div>

          {createMessage.text && (
            <p className={`message message-${createMessage.type}`}>
              {createMessage.text}
            </p>
          )}

          <form onSubmit={handleCreateUser} className="admin-create-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                required
              />
            </div>

            <button type="submit" className="form-submit" disabled={creatingUser}>
              {creatingUser ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </form>
        </section>

        <section className="admin-users">
          <div className="admin-users-header">
            <h2>Manage Users</h2>
            <p>Click the button above to load all registered accounts.</p>
          </div>

          {loadingUsers && <p>Loading users...</p>}
          {error && <p className="error-text">{error}</p>}

          {!loadingUsers && users.length === 0 && !error && (
            <p>No users loaded yet. Click Manage Users to view accounts.</p>
          )}

          {users.length > 0 && (
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td>{userItem.username}</td>
                      <td>{userItem.email}</td>
                      <td>{userItem.role}</td>
                      <td>{new Date(userItem.createdAt).toLocaleString()}</td>
                      <td className="admin-action-cell">
                        <button
                          type="button"
                          className="admin-reset-btn"
                          onClick={() => setResetPasswordUserId(userItem.id)}
                        >
                          Reset Password
                        </button>
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                          disabled={userItem.id === user?.id}
                          title={userItem.id === user?.id ? 'You cannot delete your own admin account' : 'Delete this user'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {resetPasswordUserId && (
          <section className="admin-reset-password">
            <div className="reset-password-modal">
              <div className="reset-password-header">
                <h3>Reset Password</h3>
                <button
                  type="button"
                  className="reset-password-close"
                  onClick={() => setResetPasswordUserId(null)}
                >
                  ✕
                </button>
              </div>

              {resetMessage.text && (
                <p className={`message message-${resetMessage.type}`}>
                  {resetMessage.text}
                </p>
              )}

              <form onSubmit={handleResetPassword} className="reset-password-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="reset-password-actions">
                  <button
                    type="submit"
                    className="form-submit"
                    disabled={resettingPassword}
                  >
                    {resettingPassword ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button
                    type="button"
                    className="form-cancel"
                    onClick={() => {
                      setResetPasswordUserId(null)
                      setNewPassword('')
                      setResetMessage({ type: '', text: '' })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiUser, FiMail, FiMapPin, FiGlobe, FiCalendar, FiLock, FiUnlock, FiSettings } from "react-icons/fi";

function Profile({ user }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("memes");
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    birthDate: "",
    isPrivate: false
  });

  useEffect(() => {
    if (username === user?.username) {
      setIsOwnProfile(true);
    }
    fetchProfile();
  }, [username, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/profile/${username}`);
      if (!response.ok) {
        throw new Error("Profile not found");
      }
      const data = await response.json();
      setProfile(data);
      
      // Initialize edit form
      setEditForm({
        displayName: data.profile?.displayName || "",
        bio: data.profile?.bio || "",
        location: data.profile?.location || "",
        website: data.profile?.website || "",
        birthDate: data.profile?.birthDate ? new Date(data.profile.birthDate).toISOString().split('T')[0] : "",
        isPrivate: data.profile?.isPrivate || false
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(prev => ({
          ...prev,
          profile: updatedProfile.profile
        }));
        setIsEditing(false);
        // Refresh profile data
        fetchProfile();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Profile not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.profile?.displayName?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.profile?.displayName || profile.username}
                  </h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
                
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiEdit2 />
                    <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                  </button>
                )}
              </div>

              {/* Bio */}
              {profile.profile?.bio && (
                <p className="text-gray-700 mb-4">{profile.profile.bio}</p>
              )}

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {profile.profile?.location && (
                  <div className="flex items-center space-x-2">
                    <FiMapPin />
                    <span>{profile.profile.location}</span>
                  </div>
                )}
                
                {profile.profile?.website && (
                  <div className="flex items-center space-x-2">
                    <FiGlobe />
                    <a 
                      href={profile.profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {profile.profile.website}
                    </a>
                  </div>
                )}
                
                {profile.profile?.birthDate && (
                  <div className="flex items-center space-x-2">
                    <FiCalendar />
                    <span>{new Date(profile.profile.birthDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {profile.profile?.isPrivate ? <FiLock /> : <FiUnlock />}
                  <span>{profile.profile?.isPrivate ? "Private Profile" : "Public Profile"}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats?.totalMemes || 0}</div>
                  <div className="text-sm text-gray-500">Memes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats?.totalFollowers || 0}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats?.totalViews || 0}</div>
                  <div className="text-sm text-gray-500">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats?.totalLikes || 0}</div>
                  <div className="text-sm text-gray-500">Total Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && isOwnProfile && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={editForm.displayName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter display name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={editForm.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={editForm.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={editForm.isPrivate}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  Make profile private
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("memes")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "memes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Memes
              </button>
              <button
                onClick={() => setActiveTab("collections")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "collections"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Collections
              </button>
              <button
                onClick={() => setActiveTab("followers")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "followers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Followers
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "memes" && (
              <div className="text-center py-12 text-gray-500">
                <p>User's memes will be displayed here</p>
              </div>
            )}
            
            {activeTab === "collections" && (
              <div className="text-center py-12 text-gray-500">
                <p>User's collections will be displayed here</p>
              </div>
            )}
            
            {activeTab === "followers" && (
              <div className="text-center py-12 text-gray-500">
                <p>Followers and following will be displayed here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

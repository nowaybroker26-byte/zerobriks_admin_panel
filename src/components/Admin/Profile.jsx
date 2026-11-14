import axios from "axios";
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faEnvelope, faUserAlt, faIdBadge ,faUser} from '@fortawesome/free-solid-svg-icons'; // Import the icons

class Profile extends React.Component {
  state = {
    profile: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
    },
    error: null,
    success: null,
  };

  componentDidMount() {
    const token = sessionStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      this.setState({ error: "Token not found" });
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/profile/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        console.log("Profile fetched successfully:", res.data);
        this.setState({ profile: res.data });
      })
      .catch((err) => {
        const errorMessage = err.response
          ? JSON.stringify(err.response.data)
          : err.message;
        console.error("Error fetching profile", errorMessage);
        this.setState({ error: "Error fetching profile: " + errorMessage });
      });
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      profile: {
        ...prevState.profile,
        [name]: value,
      },
    }));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      this.setState({ error: "Token not found" });
      return;
    }

    axios
      .put(
        `${process.env.REACT_APP_API_BASE_URL}/api/profile/`,
        this.state.profile,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
      .then((res) => {
        console.log("Profile updated successfully:", res.data);
        this.setState({
          profile: res.data,
          success: "Profile updated successfully!",
          error: null,
        });
      })
      .catch((err) => {
        const errorMessage = err.response
          ? JSON.stringify(err.response.data)
          : err.message;
        console.error("Error updating profile", errorMessage);
        this.setState({
          error: "Error updating profile: " + errorMessage,
          success: null,
        });
      });
  };

  render() {
    const { profile, error, success } = this.state;

    return (
      <>
        <div className="w-100 container-fluid mt-28">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="p-2 bg-white border rounded shadow-lg">
            <div>
              <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
                Profile
              </h4>
            </div>

            <div className="items-center justify-center ">
              <form
                onSubmit={this.handleSubmit}
                className="w-full p-8 mb-6 bg-white shadow-md"
              >
                <div className="row">
                  <div className="flex flex-col items-center mb-4">
                    <span className="icon w-[80%] h-[80%] flex items-center justify-center rounded-md">
                      <FontAwesomeIcon icon={faUserAlt} className="w-24 h-24" />
                    </span>
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                  </div>
                </div>

                <div className="row">
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      Email:
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={this.handleChange}
                        className="w-full pl-10 p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="mb-4 col-md-6">
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                    <FontAwesomeIcon icon={faUserAlt} className="mr-2" />
                      First Name:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="first_name"
                        value={profile.first_name}
                        onChange={this.handleChange}
                        className="w-full pl-10 p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="mb-4 col-md-6">
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                    <FontAwesomeIcon icon={faIdBadge} className="mr-2" />
                      Last Name:
                    </label>
                    <div className="relative">
                      
                      <input
                        type="text"
                        name="last_name"
                        value={profile.last_name}
                        onChange={this.handleChange}
                        className="w-full pl-10 p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="p-2 btn btn-primary rounded"
                >
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Profile;

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faEnvelope,
  faUserCircle,
  faCheckSquare,
  faListUl,
  faTimesCircle,
  faSquareArrowUpRight,
  faUserTie,
  faHandshake,
  faBuilding,
  faChartLine,
  faUsers,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import { MyContext } from "../../App";


const NotificationForm = () => {

  /*
  |--------------------------------------------------------------------------
  | Permission Context
  |--------------------------------------------------------------------------
  */

  const { can } = useContext(MyContext);


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [notification_title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [send_to, setSendTo] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();


  /*
  |--------------------------------------------------------------------------
  | Send To Options
  |--------------------------------------------------------------------------
  */

  const options = [
    {
      label: "Owner",
      value: "Owner",
      icon: faUserTie,
    },
    {
      label: "Builder",
      value: "Builder",
      icon: faHandshake,
    },
    {
      label: "Agent",
      value: "Agent",
      icon: faBuilding,
    },
  ];


  /*
  |--------------------------------------------------------------------------
  | Handle Checkbox Selection
  |--------------------------------------------------------------------------
  */

  const handleSendToChange = (e) => {

    const value = e.target.value;
    const isChecked = e.target.checked;


    if (isChecked) {

      setSendTo([
        ...send_to,
        value,
      ]);

    } else {

      setSendTo(
        send_to.filter(
          (item) => item !== value
        )
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Handle Form Submission
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {

    event.preventDefault();


    const sendToString =
      send_to.join("|");


    try {

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/send_notification`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            notification_title,
            message,
            send_to: sendToString,
          }),
        }
      );


      const responseData =
        await response.json();


      if (response.ok) {

        localStorage.setItem(
          "success",
          "Notification sent successfully!"
        );

        setTitle("");
        setMessage("");
        setSendTo([]);

        navigate(
          "/notificationsList"
        );

      } else {

        setError(
          "Failed to send notification"
        );

        console.error(
          "Error response:",
          responseData
        );

      }

    } catch (error) {

      setError(
        "Failed to send notification"
      );

      console.error(
        "Fetch error:",
        error
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="container-fluid mt-28 w-100">

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {/* Breadcrumb */}

      <nav
        className="flex justify-end mb-4"
        aria-label="Breadcrumb"
      >

        <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">

          <li>

            <Link
              to="/notificationsList"
              className="font-medium text-blue-600 transition-colors hover:underline"
            >
              Go TO Notifications
            </Link>

          </li>


          <li className="text-gray-400">
            /
          </li>


          <li>

            <span className="inline-block px-3 py-1 text-base font-bold text-gray-800 rounded-full">
              Notification Add Page
            </span>

          </li>

        </ol>

      </nav>


      {/* ================================================================
          FORM
      ================================================================= */}

      <form
        onSubmit={handleSubmit}
        className="p-2 bg-white border rounded shadow-lg"
      >

        <div className="row">


          {/* ==============================================================
              TITLE
          ============================================================== */}

          <div>

            <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">

              <FontAwesomeIcon
                icon={faBell}
                className="mr-2"
              />

              Send Notification

            </h4>

          </div>


          {/* ==============================================================
              LEFT SIDE
          ============================================================== */}

          <div className="col-md-6">

            {/* Title */}

            <div className="mb-3">

              <label
                htmlFor="notification_title"
                className="form-label font-weight-bold"
              >

                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="mr-2"
                />

                Title{" "}

                <sup className="text-danger">
                  *
                </sup>

              </label>


              <input
                type="text"
                id="notification_title"
                value={notification_title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="form-control"
                required
              />

            </div>


            {/* Message */}

            <div className="mb-3">

              <label
                htmlFor="message"
                className="form-label font-weight-bold"
              >

                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="mr-2"
                />

                Message{" "}

                <sup className="text-danger">
                  *
                </sup>

              </label>


              <textarea
                id="message"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                className="form-control"
                rows="6"
                required
              />

            </div>

          </div>


          {/* ==============================================================
              RIGHT SIDE
          ============================================================== */}

          <div className="col-md-6">

            <div className="mb-3">

              <label
                htmlFor="send_to"
                className="form-label font-weight-bold"
              >

                <FontAwesomeIcon
                  icon={faListUl}
                  className="mr-2"
                />

                Send To{" "}

                <sup className="text-danger">
                  *
                </sup>

              </label>


              {/* Selected Options */}

              {send_to.length > 0 && (

                <div className="mb-3">

                  <div className="alert alert-info">

                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      className="mr-2"
                    />

                    <strong>
                      Selected:
                    </strong>{" "}

                    {options
                      .filter(
                        (option) =>
                          send_to.includes(
                            option.value
                          )
                      )
                      .map(
                        (option) =>
                          option.label
                      )
                      .join(", ")}

                  </div>

                </div>

              )}


              {/* Checkbox List */}

              <div className="mb-3">

                {options.map(
                  (option) => (

                    <div
                      key={option.value}
                      className="form-check"
                    >

                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={option.value}
                        value={option.value}
                        checked={send_to.includes(
                          option.value
                        )}
                        onChange={
                          handleSendToChange
                        }
                      />


                      <label
                        className="form-check-label"
                        htmlFor={option.value}
                      >
                        {option.label}
                      </label>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </div>


        {/* ================================================================
            ACTION BUTTONS
        ================================================================= */}

        <div className="text-center col-md-12">


          {/* ==============================================================
              SENIOR'S CHANGE:
              notifications -> add
          ============================================================== */}

          {can("notifications", "add") && (

            <button
              type="submit"
              className="mt-4 text-center btn btn-primary"
            >

              <FontAwesomeIcon
                icon={faSquareArrowUpRight}
                className="mr-2"
              />

              Send Notification

            </button>

          )}


          {/* ==============================================================
              CANCEL BUTTON
          ============================================================== */}

          <button
            type="button"
            className="mx-2 mt-4 text-center btn btn-secondary"
            onClick={() =>
              navigate(
                "/notificationsList"
              )
            }
          >

            <FontAwesomeIcon
              icon={faTimesCircle}
              className="mr-2"
            />

            Cancel

          </button>

        </div>

      </form>

    </div>

  );

};


export default NotificationForm;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faBell,
//   faEnvelope,
//   faUserCircle,
//   faCheckSquare,
//   faListUl,
//   faTimesCircle,
//   faSquareArrowUpRight,
//   faUserTie,
//   faHandshake,
//   faBuilding,
//   faChartLine,
//   faUsers,
//   faLink,
// } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";

// const NotificationForm = () => {
//   const [notification_title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [send_to, setSendTo] = useState([]);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // Options for the "Send To" field with labels and values
//   const options = [
//     { label: "Owner", value: "Owner", icon: faUserTie },
//     { label: "Builder", value: "Builder", icon: faHandshake },
//     { label: "Agent", value: "Agent", icon: faBuilding },
   
//   ];

//   // Handle checkbox selection
//   const handleSendToChange = (e) => {
//     const value = e.target.value;
//     const isChecked = e.target.checked;

//     if (isChecked) {
//       setSendTo([...send_to, value]); // Add selected option
//     } else {
//       setSendTo(send_to.filter((item) => item !== value)); // Remove unselected option
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const sendToString = send_to.join("|"); // Convert the array to a pipe-separated string

//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL}/api/send_notification`,
//         {
         
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             notification_title,
//             message,
//             send_to: sendToString,
//           }),
//         }
//       );

//       const responseData = await response.json();

//       if (response.ok) {
//         localStorage.setItem("success", "Notification sent successfully!");
//         setTitle("");
//         setMessage("");
//         setSendTo([]);
//         navigate("/notificationsList");
//       } else {
//         setError("Failed to send notification");
//         console.error("Error response:", responseData);
//       }
//     } catch (error) {
//       setError("Failed to send notification");
//       console.error("Fetch error:", error);
//     }
//   };

//   return (
//     <div className="container-fluid mt-28 w-100">
//       {error && <div className="alert alert-danger">{error}</div>}

//       {/* Breadcrumb aligned right */}
//       <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
//         <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">
//           <li>
//             <Link
//               to="/notificationsList"
//               className="font-medium text-blue-600 transition-colors hover:underline"
//             >
//               Go TO Notifications
//             </Link>
//           </li>

//           <li className="text-gray-400">/</li>

//           <li>
//             <span className="inline-block px-3 py-1 text-base font-bold text-gray-800 rounded-full">
//               Notification Add Page
//             </span>
//           </li>
//         </ol>
//       </nav>

//       <form
//         onSubmit={handleSubmit}
//         className="p-2 bg-white border rounded shadow-lg"
//       >
//         <div className="row">
//           <div className="">
//             <h4 className="p-2 m-2 text-center bg-white border rounded shadow-sm h4">
//               <FontAwesomeIcon icon={faBell} className="mr-2" />
//               Send Notification
//             </h4>
//           </div>

//           <div className="col-md-6">
//             <div className="mb-3">
//               <label
//                 htmlFor="notification_title"
//                 className="form-label font-weight-bold"
//               >
//                 <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
//                 Title <sup className="text-danger">*</sup>
//               </label>
//               <input
//                 type="text"
//                 id="notification_title"
//                 value={notification_title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="form-control"
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="message" className="form-label font-weight-bold">
//                 <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
//                 Message <sup className="text-danger">*</sup>
//               </label>
//               <textarea
//                 id="message"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 className="form-control"
//                 rows="6"
//                 required
//               ></textarea>
//             </div>
//           </div>

//           <div className="col-md-6">
//             <div className="mb-3">
//               <label htmlFor="send_to" className="form-label font-weight-bold">
//                 <FontAwesomeIcon icon={faListUl} className="mr-2" />
//                 Send To <sup className="text-danger">*</sup>
//               </label>

//               {/* Display selected options */}
//               {send_to.length > 0 && (
//                 <div className="mb-3">
//                   <div className="alert alert-info">
//                     <FontAwesomeIcon icon={faCheckSquare} className="mr-2" />
//                     <strong>Selected:</strong>{" "}
//                     {options
//                       .filter((option) => send_to.includes(option.value))
//                       .map((option) => option.label)
//                       .join(", ")}
//                   </div>
//                 </div>
//               )}

//               {/* Checkbox list */}
//               <div className="mb-3">
//                 {options.map((option) => (
//                   <div key={option.value} className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id={option.value}
//                       value={option.value}
//                       checked={send_to.includes(option.value)}
//                       onChange={handleSendToChange}
//                     />
//                     <label className="form-check-label" htmlFor={option.value}>
//                       {option.label}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="text-center col-md-12">
//           <button type="submit" className="mt-4 text-center btn btn-primary">
//             <FontAwesomeIcon icon={faSquareArrowUpRight} className="mr-2" />
//             Send Notification
//           </button>
//           <button
//             type="button"
//             className="mx-2 mt-4 text-center btn btn-secondary"
//             onClick={() => navigate("/notificationsList")}
//           >
//             <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default NotificationForm;

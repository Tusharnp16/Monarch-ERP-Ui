import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs"; // Modern library
import { toast, ToastContainer } from "react-toastify";

const InventoryWebSocketAlert = () => {
  useEffect(() => {
    // 1. Setup SockJS and Token
    const socket = new SockJS("http://localhost:8080/ws-monarch");
    const token = localStorage.getItem("accessToken");

    // 2. Initialize the Modern Client
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // Automatically attempt to reconnect every 5 seconds if connection is lost
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("Connected to WebSocket");

        // 3. Subscribe to the Inventory Channel
        stompClient.subscribe("/topic/inventory", (message) => {
          const payload = JSON.parse(message.body);

          // 4. Trigger the meaningful Toast
          toast.error(
            <div>
              <strong>Low Stock Alert!</strong>
              <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
                <strong>{payload.variant_name}</strong> is running low. <br />
                Current Inventory: <strong>{payload.quantity}</strong> units
                remaining.
              </div>
            </div>,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            },
          );
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    // 5. Activate the connection
    stompClient.activate();

    // 6. Cleanup on unmount
    return () => {
      stompClient.deactivate();
    };
  }, []);

  return <ToastContainer />;
};

export default InventoryWebSocketAlert;

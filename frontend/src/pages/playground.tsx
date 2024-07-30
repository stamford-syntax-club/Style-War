import { Container, Flex, Notification, rem, Loader } from "@mantine/core";
import CodeEditor from "@/components/code-editor";
import Preview from "@/components/preview";
import { useEffect, useState } from "react";
import { useSocket } from "@/lib/websocket/ws";
import { useCode } from "@/lib/data-hooks/use-code";
import { IconCheck, IconX } from "@tabler/icons-react";

interface Message {
  event: string;
  remainingTime: number;
}

export default function Playground() {
  const { data: codeData, isLoading, isError } = useCode(1);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isConnection, setIsConnection] = useState(true);
  const [showNotification, setShowNotification] = useState<{
    show: boolean;
    message: string;
    color: string;
  }>({ show: true, message: "Trying to connect to backend :P", color: "none"});
  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
  const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;

  const [value, setValue] = useState(
    `<!DOCTYPE html>
<html>
    <head>
        <style></style>
    </head> <body> 
    </body>
</html>`
  );

  const socket = useSocket((message) => {
    try {
      const msg = JSON.parse(message.data) as Message;
      console.log("Received message:", msg);
      setRemainingTime(msg.remainingTime);
    } catch (error) {
      console.warn("Failed to parse message:", error, "Data:", message.data);
    }
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkConnection = () => {
      if (socket) {
        setShowNotification({
          show: true,
          message: "Connected to backend ^.^",
          color: "green",
        });
        setIsConnection(false);
      } else if (isError) {
        setShowNotification({
          show: true,
          message: "Failed to connect to backend TvT",
          color: "red",
        });
        setIsConnection(false);
      } else {
        timer = setTimeout(checkConnection, 500);
      }
    };

    checkConnection();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [socket, isError]);

  useEffect(() => {
    if (showNotification.show) {
      const timer = setTimeout(() => {
        setShowNotification({show: false, message: "", color: "none"});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification.show]);

  const handleChangeValue = (newValue: string | undefined) => {
    if (!newValue) return;

    socket?.send(
      JSON.stringify({
        event: "code:edit",
        code: {
          code: newValue,
          challengeId: 1, // TODO: get from backend
        },
      })
    );
    setValue(newValue);
  };

  return (
    <Container fluid>
      {/* notification box */}
      {showNotification.show && (
        <Notification
          icon={isConnection ? <Loader color="blue" /> : showNotification.color === "green" ? checkIcon : xIcon}
          color={showNotification.color}
          title={
            isConnection ? "Connecting na! wait" : showNotification.color === "green" ? "Success" : "Error"
          }
          onClose={() =>
            setShowNotification((prev) => ({
              ...prev,
              show: false,
            }))
          }
          styles={{
            root: {
              position: "fixed",
              bottom: rem(16),
              right: rem(16),
              zIndex: 1000,
            },
          }}
        >
          {showNotification.message}
        </Notification>
      )}
      <Flex justify="center" gap="md" align="center" mt="md">
        <CodeEditor
          value={value}
          onChange={handleChangeValue}
          remainingTime={remainingTime}
        />
        <Preview value={value} />
      </Flex>
    </Container>
  );
}

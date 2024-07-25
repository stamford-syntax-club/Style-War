import { useSetActiveChallenge } from "@/lib/data-hooks/use-set-challenge";
import { useSocket } from "@/lib/websocket/ws";
import {
  Button,
  Container,
  Text,
  Grid,
  Flex,
  Card,
  Paper,
  GridCol,
  Box,
  Title,
} from "@mantine/core";
import { useState } from "react";

interface Message {
  event: string;
  code: string;
  userId: string;
  remainingTime: number;
}

export default function AdminPage() {
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [remainingTime, setRemainingTime] = useState(0);
  const { mutate } = useSetActiveChallenge();

  useSocket((message) => {
    try {
      const msg = JSON.parse(message.data) as Message;
      if (msg.event === "timer:status") {
        setRemainingTime(msg.remainingTime);
      }

      if (msg.event === "code:edit") {
        setCodes((prev) => {
          return {
            ...prev,
            [msg.userId]: msg.code,
          };
        });
      }
    } catch (error) {
      console.warn("Failed to parse message:", error, "Data:", message.data);
    }
  }, "admin");

  const teams = new Array(6).fill("Team");

  return (
    <Container fluid>
      {/* <div className="flex sticky top-14 z-10">
        <div className=" bg-black rounded-2xl w-full h-16 content-center">
          <Grid mt={8}>
            <GridCol span={4}>
              <Button
                onClick={() => {
                  mutate({ id: 1, duration: 1 });
                }}
              >
                Start!
              </Button>
            </GridCol>

            <GridCol span={4}>
              <Text ta="center" fw={700} size="28px">
                Admin Panel
              </Text>
            </GridCol>

            <GridCol span={4}>
              <Text size="24px" pl="20px">
                Remaining Time: {remainingTime}
              </Text>
            </GridCol>
          </Grid>
        </div>
      </div> */}
      <Box className="sticky top-14 z-10 bg-neutral-900">
        <Flex justify="space-evenly" align="center">
          <Button
            onClick={() => {
              mutate({ id: 1, duration: 1 });
            }}
            w={165}
            size="md"
          >
            Start
          </Button>
          <Title order={1} size={50}>
            Admin Panel
          </Title>
          <Text className="text-2xl">Remaining Time: {remainingTime}</Text>
        </Flex>
      </Box>
      <Flex align="center" justify="center" wrap="wrap">
        {teams.map((team, index) => {
          const userId = `user${index + 1}`;
          const code = codes[userId] || "";

          return (
            <Flex key={index} justify="space-between">
              <Card
                shadow="md"
                padding="lg"
                radius="md"
                className="flex justify-center items-center m-2"
                style={{
                  width: 800,
                  height: 500,
                  backgroundColor: "#3b82f6",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }} //isn't all this style prop redundant? can't we just use the className?
              >
                <Text td="center" fw={700} size="lg">
                  {team} {index + 1}
                </Text>
                {code && (
                  <Paper
                    className="w-full h-full border bg-blue-900 p-1 overflow-hidden"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 1,
                    }}
                  >
                    <iframe
                      title={`preview-${index}`}
                      srcDoc={code}
                      className="w-full h-full border-none"
                    />
                  </Paper>
                )}
              </Card>
            </Flex>
          );
        })}
      </Flex>
    </Container>
  );
}

// <Grid.Col
// span={4}
// style={{
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   flexDirection: "column",
// }}
// >
// <Text size="28px" fw={700} mb="md" td="center">
//   TIMER
// </Text>
// <Text size="24px" td="center">
//   {remainingTime}
// </Text>
// </Grid.Col>

{
  /* <div className="flex mt-6">
        <div className="w-3/4 flex flex-wrap gap-4">
          {teams.map((team, index) => (
            <div key={index} className="flex justify-center">
              <div className="bg-blue-500 text-white w-[660px] h-[380px] p-5 text-center">
                <p className="font-bold">{team}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="w-1/4 justify-center content-center">
          <div className="text-center text-4xl font-bold p-4">TIMER</div>
          <div className="text-center text-2xl">{remainingTime}</div>
        </div>
      </div> */
}

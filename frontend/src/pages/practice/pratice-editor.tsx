import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Box, Button, Title, Flex, Text } from "@mantine/core";

interface PracticeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  timeDuration?: number;
}

export default function PracticeEditor({
  value,
  onChange,
  timeDuration,
}: PracticeEditorProps) {
  const [isEditorEnabled, setIsEditorEnabled] = useState(false);
  const [isTimeLeft, setIsTimeLeft] = useState(timeDuration || 0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isEditorEnabled && isTimeLeft > 0) {
      timer = setInterval(() => {
        setIsTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimeLeft === 0) {
      setIsEditorEnabled(false);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isEditorEnabled, isTimeLeft]);

  const handleStart = () => {
    setIsEditorEnabled(true);
    setIsTimeLeft(timeDuration || 0);
  };

  const timeFormatter = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Box>
      <Flex align="center" justify="space-between">
        <Title>Code Editor</Title>
        <Box className="flex justify-end">
          <Button
            size="xs"
            variant="filled"
            onClick={handleStart}
            disabled={isTimeLeft > 0 && isEditorEnabled}
            color={!isEditorEnabled ? "green" : ""}
            mr="md"
          >
            {isTimeLeft === 0
              ? "Restart"
              : isEditorEnabled
              ? "Cooking"
              : "Start"}
          </Button>
          <Text size="lg" fw={700} className="self-end">
            Time remaining : {`${timeFormatter(isTimeLeft)}s`}
          </Text>
        </Box>
      </Flex>
      <Editor
        className="border border-gray-600 rounded p-1 "
        height="80vh"
        width="50vw"
        defaultLanguage="html"
        language="html, css"
        defaultValue=""
        theme="vs-dark"
        value={value}
        onChange={(newValue) => onChange(newValue || "")}
        options={{ readOnly: !isEditorEnabled }}
      />
    </Box>
  );
}

import React, { FC, MutableRefObject } from "react";
import styled from "styled-components";

export const VideoCanvas: FC<{
  canvasRef: MutableRefObject<HTMLCanvasElement>;
  style: Partial<{ width: number; height: number }>;
  source?: { width: number; height: number };
}> = ({ canvasRef, style, source }) => {
  const { width, height } = style;
  const sw = source ? source.width : width;
  const sh = source ? source.height : height;

  const ratio = sw / sh;
  let h: number, v: number;

  if (sh < sw) {
    h = width;
    v = width / ratio;
  } else {
    v = height;
    h = height / ratio;
  }

  return (
    <Container style={{ width, height }}>
      {source && (
        <canvas
          ref={canvasRef}
          style={{ width: h, height: v }}
          width={h}
          height={v}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

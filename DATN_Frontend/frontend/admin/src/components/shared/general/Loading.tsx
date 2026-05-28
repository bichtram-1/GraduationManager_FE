import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Flex } from 'antd';

function Loading() {
  return (
    <Flex justify="center" align="center" className="h-[calc(100vh-140px)] w-full">
      <DotLottieReact
        src="/animations/loading_fixed.json"
        loop
        autoplay
        className="w-[200px]"
      />
    </Flex>
  );
}

export default Loading;

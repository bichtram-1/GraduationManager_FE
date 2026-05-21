import { Steps } from 'antd'
import React from 'react'

interface Step {
  title: string;
  content: React.ReactNode;
}

interface ModalMultiStepProps {
  currentStep: number;
  steps: Step[];
}

const { Step } = Steps

const ModalMultiStep: React.FC<ModalMultiStepProps> = ({ currentStep, steps }) => {
  return (
    <>
      <Steps current={currentStep} progressDot className='my-9'>
        {steps.map(item => (
          <Step 
            key={item.title} 
            title={item.title} 
          />
        ))}
      </Steps>

      <div key={steps[currentStep].title}>{steps[currentStep].content}</div>

    </>
  )
}

export default ModalMultiStep
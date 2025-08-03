import React, { useState } from 'react';
import { Button, Flex, Heading, Text, Card } from '@radix-ui/themes';
import toast from 'react-hot-toast';

interface WelcomeTourProps {
  onTourComplete: () => void;
}

const WelcomeTour: React.FC<WelcomeTourProps> = ({ onTourComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Capture This Chaos",
      caption: "Click the Atrium icon once-bam! Your mess becomes 'New Group 0'.",
      image: "/path/to/screenshot1.gif", // Placeholder
    },
    {
      title: "Jump Like a Jedi",
      caption: "Smash Ctrl/⌘‑Shift‑1.9 to swap groups; your old tabs vanish, the new set pops in.",
      image: "/path/to/screenshot2.gif", // Placeholder
    },
    {
      title: "Drag, Drop, Dominate",
      caption: "Open Group Management to shuffle tabs between groups-goodbye clutter.",
      image: "/path/to/screenshot3.gif", // Placeholder
    },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    toast.success('Hotkeys active', {
      duration: 2000,
      position: 'bottom-center',
    });
    onTourComplete();
  };

  const handleSkip = () => {
    toast.success('Hotkeys active', {
      duration: 2000,
      position: 'bottom-center',
    });
    onTourComplete();
  };

  const currentSlide = slides[step];

  return (
    <Card size="2" style={{ maxWidth: 500, margin: 'auto', padding: '20px' }}>
      <Flex direction="column" gap="3">
        <Heading as="h2" size="6" style={{ textAlign: 'center' }}>{currentSlide.title}</Heading>
        <Text as="p" size="2" style={{ textAlign: 'center' }}>{currentSlide.caption}</Text>
        {/* Placeholder for image/GIF */}
        <div style={{ backgroundColor: '#eee', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text size="3">{`Image/GIF for ${currentSlide.title}`}</Text>
        </div>
        <Flex justify="between" mt="4">
          {step > 0 ? (
            <Button onClick={handleBack} variant="soft">Back</Button>
          ) : (
            <Button onClick={handleSkip} variant="soft">Skip Tour</Button>
          )}
          <Button onClick={handleNext} variant="solid">{step < slides.length - 1 ? 'Next' : 'Finish'}</Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default WelcomeTour;
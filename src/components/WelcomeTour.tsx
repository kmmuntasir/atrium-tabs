import React, { useState } from 'react';
import { Flex, Button, Text } from '@radix-ui/themes';
import toast from 'react-hot-toast';

interface WelcomeTourProps {
  onSkip: () => void;
  onFinish: () => void;
}

const WelcomeTour: React.FC<WelcomeTourProps> = ({ onSkip, onFinish }) => {
  const [slide, setSlide] = useState(1);

  const handleFinish = () => {
    onFinish();
    toast.success('Hotkeys active!');
  };

  return (
    <Flex direction="column" gap="4" align="center" style={{ padding: '20px' }}>
      <h2>Welcome/Quick Tour</h2>

      {slide === 1 && (
        <Flex direction="column" gap="2" align="center">
          <h3>Slide 1: Capture This Chaos</h3>
          <Text align="center">
            Click the Atrium icon once-bam! Your mess becomes 'New Group 0'.
          </Text>
          {/* TODO: Add screenshot/GIF of cursor hitting toolbar icon -> popup flashes, "+ Save window" clicked -> popup shows newly added "New Group 0" row. */}
          <div style={{ width: '100%', height: '200px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Image/GIF for Slide 1 (Manually add media here)
          </div>
          <Flex gap="2" mt="3">
            <Button onClick={() => setSlide(2)}>Next</Button>
            <Button variant="outline" onClick={onSkip}>Skip Tour</Button>
          </Flex>
        </Flex>
      )}

      {slide === 2 && (
        <Flex direction="column" gap="2" align="center">
          <h3>Slide 2: Jump Like a Jedi</h3>
          <Text align="center">
            Smash Ctrl/⌘‑Shift‑1.9 to swap groups; your old tabs vanish, the new set pops in.
          </Text>
          {/* TODO: Add screenshot/GIF of animated key-combo overlay -> instant tab-swap in the same window; badge shows tab count updating. */}
          <div style={{ width: '100%', height: '200px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Image/GIF for Slide 2 (Manually add media here)
          </div>
          <Flex gap="2" mt="3">
            <Button onClick={() => setSlide(1)} variant="outline">Back</Button>
            <Button onClick={() => setSlide(3)}>Next</Button>
            <Button variant="outline" onClick={onSkip}>Skip Tour</Button>
          </Flex>
        </Flex>
      )}

      {slide === 3 && (
        <Flex direction="column" gap="2" align="center">
          <h3>Slide 3: Drag, Drop, Dominate</h3>
          <Text align="center">
            Open Group Management to shuffle tabs between groups-goodbye clutter.
          </Text>
          {/* TODO: Add screenshot/GIF of Management page in side-by-side mode; user drags a tab from left column's Dev group into right column's Research group, row count updates. */}
          <div style={{ width: '100%', height: '200px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Image/GIF for Slide 3 (Manually add media here)
          </div>
          <Flex gap="2" mt="3">
            <Button onClick={() => setSlide(2)} variant="outline">Back</Button>
            <Button onClick={handleFinish}>Finish</Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default WelcomeTour;
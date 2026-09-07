import { Text } from '@react-three/drei';
import { Component, type ComponentProps, type ReactNode, Suspense } from 'react';

/** Font labels are optional: neither a pending nor a failed font may hide geometry. */
class LabelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneText(props: ComponentProps<typeof Text>) {
  return (
    <LabelBoundary>
      <Suspense fallback={null}>
        <Text {...props} />
      </Suspense>
    </LabelBoundary>
  );
}

import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect from the root (/) to the tabs/index (home) screen
  return <Redirect href="/tabs" />;
}
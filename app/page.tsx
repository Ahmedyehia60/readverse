// app/page.tsx
export default async function Home() {
  await new Promise((r) => setTimeout(r, 9000));
  return (
    <main>
      <h1>Welcome to the Home Page</h1>
    </main>
  );
}

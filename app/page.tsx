export default function HomePage(){
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome to MyVoice</h2>
      <p>Login / Signup to generate voice content. Credits system, payments and admin panel ready.</p>
      <div>
        <a className="px-4 py-2 bg-blue-600 text-white rounded" href="/auth">Login / Signup</a>
      </div>
    </div>
  )
}

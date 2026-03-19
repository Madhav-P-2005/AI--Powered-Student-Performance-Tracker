// components/ui/BackgroundOrbs.jsx — Animated gradient background blobs

const BackgroundOrbs = ({ colors = ['indigo', 'purple', 'emerald'] }) => {
  const colorMap = {
    indigo: 'bg-indigo-400/20',
    purple: 'bg-purple-400/20',
    emerald: 'bg-emerald-400/20',
    amber: 'bg-amber-400/20',
  };

  return (
    <>
      {colors.map((color, i) => (
        <div
          key={i}
          className={`absolute w-96 h-96 ${colorMap[color] || colorMap.indigo} rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob -z-10`}
          style={{
            animationDelay: `${i * 2}s`,
            top: i === 0 ? '25%' : i === 1 ? '33%' : 'auto',
            bottom: i === 2 ? '-8rem' : 'auto',
            left: i === 0 ? '25%' : i === 2 ? '33%' : 'auto',
            right: i === 1 ? '25%' : 'auto',
          }}
        />
      ))}
    </>
  );
};

export default BackgroundOrbs;

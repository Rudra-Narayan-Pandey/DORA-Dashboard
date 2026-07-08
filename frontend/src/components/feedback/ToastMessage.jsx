import toast from 'react-hot-toast';

const toastStyle = {
  background: 'rgba(10, 15, 30, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(0, 242, 254, 0.2)',
  borderRadius: '8px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 15px rgba(0, 242, 254, 0.1)',
  color: '#e2e8f0',
  fontFamily: "'Space Mono', 'Fira Code', monospace",
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

export const showSuccessToast = (message) => {
  toast.success(message, {
    style: {
      ...toastStyle,
      borderColor: 'rgba(5, 255, 196, 0.4)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 15px rgba(5, 255, 196, 0.15)'
    },
    iconTheme: {
      primary: '#05ffc4',
      secondary: '#050816',
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    style: {
      ...toastStyle,
      borderColor: 'rgba(255, 42, 95, 0.4)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 15px rgba(255, 42, 95, 0.15)'
    },
    iconTheme: {
      primary: '#ff2a5f',
      secondary: '#050816',
    },
  });
};

export const showSystemToast = (message, title = "System Notification") => {
  toast(
    (_t) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-dora-cyan font-bold">{title}</span>
        <span>{message}</span>
      </div>
    ),
    {
      style: toastStyle,
      icon: '📡'
    }
  );
};

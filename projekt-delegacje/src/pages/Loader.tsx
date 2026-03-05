import '/src/styles/Loader.css';

interface LoaderProps {
    fullScreen?: boolean;
    message?: string;
    size?: number;
}

export const Loader = ({ fullScreen = false, message = 'Ładowanie...', size = 48 }: LoaderProps) => {
    const wrapperClass = fullScreen ? 'loader-wrapper-full' : 'loader-wrapper-inline';

    return (
        <div className={`loader-wrapper ${wrapperClass}`}>
            <div className="loader-container">

                <div className="loader-spinner" style={{ width: size, height: size }}>
                    <div className="loader-spinner-circle" />
                    <div className="loader-spinner-circle inner" />
                </div>

                {message && <p className="loader-message">{message}</p>}
            </div>
        </div>
    );
};

export default Loader;
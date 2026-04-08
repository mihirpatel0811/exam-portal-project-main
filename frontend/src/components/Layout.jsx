import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content page-enter">
      {children}
    </main>
  </div>
);

export default Layout;

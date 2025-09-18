import { Link, useLocation } from 'wouter';

interface SidebarProps {
  onTemplatesClick: () => void;
}

export default function Sidebar({ onTemplatesClick }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: 'fas fa-home', label: 'Dashboard', testId: 'nav-dashboard' },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground flex items-center" data-testid="app-title">
          <i className="fas fa-file-signature text-primary mr-3"></i>
          DocuSign Pro
        </h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div 
                  className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === item.path 
                      ? 'text-foreground bg-accent' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  data-testid={item.testId}
                >
                  <i className={`${item.icon} mr-3 ${location === item.path ? 'text-primary' : ''}`}></i>
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={onTemplatesClick}
              className="w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
              data-testid="nav-templates"
            >
              <i className="fas fa-folder-open mr-3"></i>
              Templates
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground mr-3">
            <i className="fas fa-user"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground" data-testid="user-name">John Manager</p>
            <p className="text-xs text-muted-foreground" data-testid="user-role">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

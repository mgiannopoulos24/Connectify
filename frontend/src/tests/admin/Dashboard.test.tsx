import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AdminDashboardPage from '@/pages/admin/Dashboard';
import * as adminService from '@/services/adminService';
import { DashboardStats } from '@/types/admin';

vi.mock('@/services/adminService');

const mockGetDashboardStats = vi.spyOn(adminService, 'getDashboardStats');

vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    Loader2: () => <div data-testid="loader" />,
    Users: () => <div data-testid="users-icon" />,
    Handshake: () => <div data-testid="handshake-icon" />,
    BriefcaseBusiness: () => <div data-testid="briefcase-icon" />,
    FileText: () => <div data-testid="filetext-icon" />,
  };
});

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display a loading spinner while fetching data', () => {
    mockGetDashboardStats.mockReturnValue(new Promise(() => {}));
    render(<AdminDashboardPage />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should display an error message if fetching stats fails', async () => {
    const errorMessage = 'Failed to fetch dashboard statistics.';
    mockGetDashboardStats.mockRejectedValue(new Error('API Error'));

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('should display the dashboard with correct stats on successful fetch', async () => {
    const mockStats: DashboardStats = {
      total_users: 150,
      accepted_connections: 320,
      total_job_postings: 45,
      total_posts: 1200,
    };
    mockGetDashboardStats.mockResolvedValue(mockStats);

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText(mockStats.total_users.toString())).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();

    expect(screen.getByText('Accepted Connections')).toBeInTheDocument();
    expect(screen.getByText(mockStats.accepted_connections.toString())).toBeInTheDocument();
    expect(screen.getByTestId('handshake-icon')).toBeInTheDocument();

    expect(screen.getByText('Total Job Postings')).toBeInTheDocument();
    expect(screen.getByText(mockStats.total_job_postings.toString())).toBeInTheDocument();
    expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();

    expect(screen.getByText('Total Posts')).toBeInTheDocument();
    expect(screen.getByText(mockStats.total_posts.toString())).toBeInTheDocument();
    expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();

    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('should call getDashboardStats once on component mount', async () => {
    mockGetDashboardStats.mockResolvedValue({
      total_users: 0,
      accepted_connections: 0,
      total_job_postings: 0,
      total_posts: 0,
    });
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(mockGetDashboardStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should correctly display zero for all statistics', async () => {
      const zeroStats: DashboardStats = {
        total_users: 0,
        accepted_connections: 0,
        total_job_postings: 0,
        total_posts: 0,
      };
      mockGetDashboardStats.mockResolvedValue(zeroStats);

      render(<AdminDashboardPage />);

      await waitFor(() => {
        const statValues = screen.getAllByText('0');
        expect(statValues).toHaveLength(4);
      });
    });

    it('should correctly display large numbers for all statistics', async () => {
      const largeStats: DashboardStats = {
        total_users: 1_234_567,
        accepted_connections: 9_876_543,
        total_job_postings: 500_000,
        total_posts: 25_000_000,
      };
      mockGetDashboardStats.mockResolvedValue(largeStats);

      render(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('1234567')).toBeInTheDocument();
        expect(screen.getByText('9876543')).toBeInTheDocument();
        expect(screen.getByText('500000')).toBeInTheDocument();
        expect(screen.getByText('25000000')).toBeInTheDocument();
      });
    });

    it('should render the dashboard without cards if stats object is null', async () => {
      mockGetDashboardStats.mockResolvedValue(null as any);
      render(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
      expect(screen.queryByText('Accepted Connections')).not.toBeInTheDocument();
      expect(screen.queryByText('Total Job Postings')).not.toBeInTheDocument();
      expect(screen.queryByText('Total Posts')).not.toBeInTheDocument();
    });

    it('should render cards correctly even if some stat values are missing or not numbers', async () => {
      const partialStats = {
        total_users: 100,
        total_job_postings: null, 
        total_posts: 'N/A', 
      };
      mockGetDashboardStats.mockResolvedValue(partialStats as any);

      render(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Total Posts')).toBeInTheDocument();
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });

      const connectionsHeader = screen.getByText('Accepted Connections').parentElement;
      const connectionsContent = connectionsHeader?.nextElementSibling;
      expect(connectionsContent?.textContent).toBe('');

      const jobsHeader = screen.getByText('Total Job Postings').parentElement;
      const jobsContent = jobsHeader?.nextElementSibling;
      expect(jobsContent?.textContent).toBe('');
    });
  });
});
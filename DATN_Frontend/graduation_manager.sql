-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 12, 2026 at 06:09 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `graduation_manager`
--

-- --------------------------------------------------------

--
-- Table structure for table `baocaotiendo`
--

CREATE TABLE `baocaotiendo` (
  `bao_cao_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `dot_id` int(11) NOT NULL,
  `tuan_so` int(11) NOT NULL,
  `noi_dung` varchar(255) DEFAULT NULL,
  `duong_dan_file` varchar(255) DEFAULT NULL,
  `trang_thai` enum('DA_NOP','TRE_HAN') NOT NULL DEFAULT 'DA_NOP',
  `loai_bao_cao` enum('DO_AN','THUC_TAP') NOT NULL,
  `thoi_gian_nop` timestamp NULL DEFAULT current_timestamp(),
  `thoi_gian_huy` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `baocaotiendo`
--

INSERT INTO `baocaotiendo` (`bao_cao_id`, `sinh_vien_id`, `dot_id`, `tuan_so`, `noi_dung`, `duong_dan_file`, `trang_thai`, `loai_bao_cao`, `thoi_gian_nop`, `thoi_gian_huy`) VALUES
(1, 1, 1, 1, 'Tìm hiểu quy trình, cài đặt môi trường dev, đọc tài liệu dự án', 'bc_sv1_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(2, 1, 1, 2, 'Làm quen codebase, fix bug module authentication', 'bc_sv1_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(3, 1, 1, 3, 'Viết unit test cho API user management', 'bc_sv1_t3.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-30 08:45:20', NULL),
(4, 1, 1, 4, 'Implement tính năng upload avatar, resize ảnh', 'bc_sv1_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(5, 1, 1, 5, 'Tham gia sprint review, viết tài liệu API', 'bc_sv1_t5.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-13 08:45:20', NULL),
(6, 1, 1, 6, 'Phát triển module email notification, test E2E', 'bc_sv1_t6.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-20 08:45:20', NULL),
(7, 1, 1, 7, 'Tối ưu query, giảm response time 30%', 'bc_sv1_t7.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-27 08:45:20', NULL),
(8, 1, 1, 8, 'Viết báo cáo tổng kết, bàn giao code', 'bc_sv1_t8.pdf', 'DA_NOP', 'THUC_TAP', '2026-03-06 08:45:20', NULL),
(9, 2, 1, 1, 'Onboarding, tìm hiểu ReactJS và cấu trúc project', 'bc_sv2_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(10, 2, 1, 2, 'Tham gia sprint, code UI component list/table', 'bc_sv2_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(11, 2, 1, 3, 'Implement form validation, tích hợp API đăng nhập', 'bc_sv2_t3.pdf', 'TRE_HAN', 'THUC_TAP', '2026-02-02 02:22:15', NULL),
(12, 2, 1, 4, 'Xây dựng dashboard hiển thị thống kê', 'bc_sv2_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(13, 2, 1, 5, 'Fix bug responsive mobile, review code với mentor', 'bc_sv2_t5.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-13 08:45:20', NULL),
(14, 3, 1, 1, 'Tìm hiểu NodeJS Express, REST API convention', 'bc_sv3_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(15, 3, 1, 2, 'Viết CRUD API cho module sản phẩm', 'bc_sv3_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(16, 3, 1, 3, 'Tích hợp JWT authentication', 'bc_sv3_t3.pdf', 'TRE_HAN', 'THUC_TAP', '2026-02-02 02:22:15', NULL),
(17, 7, 1, 1, 'Tìm hiểu hệ thống quản lý bán hàng, đọc ERD', 'bc_sv7_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(18, 7, 1, 2, 'Xây dựng module quản lý sản phẩm backend', 'bc_sv7_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(19, 7, 1, 3, 'Viết API đơn hàng, tích hợp service thanh toán', 'bc_sv7_t3.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-30 08:45:20', NULL),
(20, 7, 1, 4, 'Implement tìm kiếm full-text với Elasticsearch', 'bc_sv7_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(21, 7, 1, 5, 'Deploy lên staging, cấu hình nginx reverse proxy', 'bc_sv7_t5.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-13 08:45:20', NULL),
(22, 7, 1, 6, 'Viết integration test, fix bug production', 'bc_sv7_t6.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-20 08:45:20', NULL),
(23, 7, 1, 7, 'Tối ưu hiệu suất database, thêm index', 'bc_sv7_t7.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-27 08:45:20', NULL),
(24, 7, 1, 8, 'Viết tài liệu kỹ thuật, demo sản phẩm cho mentor', 'bc_sv7_t8.pdf', 'DA_NOP', 'THUC_TAP', '2026-03-06 08:45:20', NULL),
(25, 13, 1, 1, 'Làm quen dự án React + TypeScript, đọc Figma', 'bc_sv13_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(26, 13, 1, 2, 'Build component Header, Sidebar, Menu', 'bc_sv13_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(27, 13, 1, 3, 'Implement page Dashboard với biểu đồ', 'bc_sv13_t3.pdf', 'TRE_HAN', 'THUC_TAP', '2026-02-02 02:22:15', NULL),
(28, 13, 1, 4, 'Tích hợp API danh sách người dùng, phân trang', 'bc_sv13_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(29, 13, 1, 5, 'Build form quản lý role/permission', 'bc_sv13_t5.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-13 08:45:20', NULL),
(30, 13, 1, 6, 'Fix bug, viết Storybook documentation', 'bc_sv13_t6.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-20 08:45:20', NULL),
(31, 23, 1, 1, 'Tìm hiểu Flutter, Dart, cài đặt Android Studio', 'bc_sv23_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(32, 23, 1, 2, 'Xây dựng UI màn hình đăng nhập, đăng ký', 'bc_sv23_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(33, 23, 1, 3, 'Tích hợp REST API, quản lý state với Provider', 'bc_sv23_t3.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-30 08:45:20', NULL),
(34, 23, 1, 4, 'Implement push notification, deep link', 'bc_sv23_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(35, 23, 1, 5, 'Build màn hình danh sách sản phẩm, giỏ hàng', 'bc_sv23_t5.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-13 08:45:20', NULL),
(36, 23, 1, 6, 'Tích hợp thanh toán MoMo SDK', 'bc_sv23_t6.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-20 08:45:20', NULL),
(37, 23, 1, 7, 'Test trên thiết bị thật Android/iOS, fix UI bugs', 'bc_sv23_t7.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-27 08:45:20', NULL),
(38, 23, 1, 8, 'Build release APK, viết hướng dẫn cài đặt', 'bc_sv23_t8.pdf', 'DA_NOP', 'THUC_TAP', '2026-03-06 08:45:20', NULL),
(39, 33, 1, 1, 'Tìm hiểu topology mạng công ty, ghi chú sơ đồ', 'bc_sv33_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(40, 33, 1, 2, 'Cấu hình VLAN trên switch Cisco Catalyst', 'bc_sv33_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(41, 33, 1, 3, 'Cấu hình trunk port, inter-VLAN routing', 'bc_sv33_t3.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-30 08:45:20', NULL),
(42, 33, 1, 4, 'Thiết lập OSPF giữa các router', 'bc_sv33_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(43, 33, 1, 5, 'Cấu hình ACL kiểm soát truy cập', 'bc_sv33_t5.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-13 08:45:20', NULL),
(44, 33, 1, 6, 'Cài đặt Nagios giám sát hệ thống mạng', 'bc_sv33_t6.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-20 08:45:20', NULL),
(45, 33, 1, 7, 'Thực hành xử lý sự cố mạng thực tế', 'bc_sv33_t7.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-27 08:45:20', NULL),
(46, 33, 1, 8, 'Viết báo cáo tổng kết, vẽ lại topology mạng', 'bc_sv33_t8.pdf', 'DA_NOP', 'THUC_TAP', '2026-03-06 08:45:20', NULL),
(47, 34, 1, 1, 'Tìm hiểu thiết bị mạng, phân biệt switch/router/firewall', 'bc_sv34_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(48, 34, 1, 2, 'Cấu hình VLAN cơ bản trên switch', 'bc_sv34_t2.pdf', 'TRE_HAN', 'THUC_TAP', '2026-01-26 02:22:15', NULL),
(49, 34, 1, 3, 'Tham gia hỗ trợ xử lý sự cố kết nối', 'bc_sv34_t3.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-30 08:45:20', NULL),
(50, 34, 1, 4, 'Cài đặt và cấu hình pfSense firewall', 'bc_sv34_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(51, 41, 1, 1, 'Tìm hiểu hệ thống server, cài đặt Windows Server', 'bc_sv41_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(52, 41, 1, 2, 'Cài đặt và cấu hình Active Directory Domain', 'bc_sv41_t2.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-23 08:45:20', NULL),
(53, 41, 1, 3, 'Quản lý Group Policy, phân quyền người dùng', 'bc_sv41_t3.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-30 08:45:20', NULL),
(54, 41, 1, 4, 'Cấu hình DNS Server, DHCP Server', 'bc_sv41_t4.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-06 08:45:20', NULL),
(55, 41, 1, 5, 'Cài đặt IIS Web Server, host ứng dụng nội bộ', 'bc_sv41_t5.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-13 08:45:20', NULL),
(56, 41, 1, 6, 'Backup và phục hồi dữ liệu với Windows Backup', 'bc_sv41_t6.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-20 08:45:20', NULL),
(57, 41, 1, 7, 'Giám sát hiệu suất hệ thống với Performance Monitor', 'bc_sv41_t7.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-27 08:45:20', NULL),
(58, 41, 1, 8, 'Viết quy trình vận hành hệ thống, tổng kết', 'bc_sv41_t8.pdf', 'DA_NOP', 'THUC_TAP', '2026-03-06 08:45:20', NULL),
(59, 42, 1, 1, 'Tìm hiểu cơ sở hạ tầng công ty', 'bc_sv42_t1.pdf', 'DA_NOP', 'THUC_TAP', '2026-01-16 08:45:20', NULL),
(60, 42, 1, 2, 'Hỗ trợ cài đặt máy tính văn phòng', 'bc_sv42_t2.pdf', 'TRE_HAN', 'THUC_TAP', '2026-01-26 02:22:15', NULL),
(61, 1, 2, 1, 'Phân tích yêu cầu, thiết kế CSDL, ERD diagram', 'da_sv1_t1.pdf', 'DA_NOP', 'DO_AN', '2026-03-06 08:45:20', NULL),
(62, 1, 2, 2, 'Xây dựng backend API: auth, product, cart module', 'da_sv1_t2.pdf', 'DA_NOP', 'DO_AN', '2026-03-13 08:45:20', NULL),
(64, 1, 2, 4, 'Hoàn thiện frontend, fix bug, viết tài liệu', 'da_sv1_t4.pdf', 'DA_NOP', 'DO_AN', '2026-03-27 08:45:20', NULL),
(67, 2, 2, 3, 'Tích hợp API, quản lý state Redux Toolkit', 'da_sv2_t3.pdf', 'TRE_HAN', 'DO_AN', '2026-03-23 02:22:15', NULL),
(69, 7, 2, 1, 'Phân tích Agile workflow, thiết kế DB sprint/task', 'da_sv7_t1.pdf', 'DA_NOP', 'DO_AN', '2026-03-06 08:45:20', NULL),
(71, 7, 2, 3, 'Implement kanban board drag-drop, tích hợp Slack', 'da_sv7_t3.pdf', 'DA_NOP', 'DO_AN', '2026-03-20 08:45:20', NULL),
(73, 8, 2, 2, 'Build frontend kanban với dnd-kit library', 'da_sv8_t2.pdf', 'TRE_HAN', 'DO_AN', '2026-03-16 02:22:15', NULL),
(74, 23, 2, 1, 'Phác thảo wireframe Flutter, thiết kế database', 'da_sv23_t1.pdf', 'DA_NOP', 'DO_AN', '2026-03-06 08:45:20', NULL),
(75, 23, 2, 2, 'Build UI màn hình chính, đăng nhập, danh sách BS', 'da_sv23_t2.pdf', 'DA_NOP', 'DO_AN', '2026-03-13 08:45:20', NULL),
(76, 23, 2, 3, 'Tích hợp API đặt lịch, cấu hình FCM notification', 'da_sv23_t3.pdf', 'DA_NOP', 'DO_AN', '2026-03-20 08:45:20', NULL),
(77, 23, 2, 4, 'Test toàn bộ flow, fix bug, build release', 'da_sv23_t4.pdf', 'DA_NOP', 'DO_AN', '2026-03-27 08:45:20', NULL),
(78, 33, 2, 1, 'Thiết kế topology mạng DN vừa, mô hình hóa GNS3', 'da_sv33_t1.pdf', 'DA_NOP', 'DO_AN', '2026-03-06 08:45:20', NULL),
(79, 33, 2, 2, 'Cấu hình VLAN, trunk, inter-VLAN routing', 'da_sv33_t2.pdf', 'DA_NOP', 'DO_AN', '2026-03-13 08:45:20', NULL),
(80, 33, 2, 3, 'Thiết lập OSPF, VPN site-to-site, ACL policy', 'da_sv33_t3.pdf', 'DA_NOP', 'DO_AN', '2026-03-20 08:45:20', NULL),
(81, 33, 2, 4, 'Test toàn bộ, viết tài liệu kỹ thuật', 'da_sv33_t4.pdf', 'DA_NOP', 'DO_AN', '2026-03-27 08:45:20', NULL),
(82, 37, 2, 1, 'Cài đặt Snort, tìm hiểu rule syntax cơ bản', 'da_sv37_t1.pdf', 'DA_NOP', 'DO_AN', '2026-03-06 08:45:20', NULL),
(83, 37, 2, 2, 'Viết custom rule phát hiện port scan', 'da_sv37_t2.pdf', 'TRE_HAN', 'DO_AN', '2026-03-16 02:22:15', NULL),
(84, 41, 2, 1, 'Phân tích yêu cầu script AD management', 'da_sv41_t1.pdf', 'DA_NOP', 'DO_AN', '2026-03-06 08:45:20', NULL),
(85, 41, 2, 2, 'Viết PowerShell script tạo/xóa user hàng loạt', 'da_sv41_t2.pdf', 'DA_NOP', 'DO_AN', '2026-03-13 08:45:20', NULL),
(86, 41, 2, 3, 'Script backup tự động, gửi email alert', 'da_sv41_t3.pdf', 'DA_NOP', 'DO_AN', '2026-03-20 08:45:20', NULL),
(87, 41, 2, 4, 'Test toàn bộ script, viết documentation', 'da_sv41_t4.pdf', 'DA_NOP', 'DO_AN', '2026-03-27 08:45:20', NULL),
(100, 2, 1, 6, 'Hoàn thiện tính năng, review code với mentor', 'bc_sv2_t6.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-20 08:45:20', NULL),
(101, 2, 1, 7, 'Fix bug, tối ưu hiệu suất component', 'bc_sv2_t7.pdf', 'DA_NOP', 'THUC_TAP', '2026-02-27 08:45:20', NULL),
(102, 2, 1, 8, 'Viết báo cáo tổng kết, demo sản phẩm', 'bc_sv2_t8.pdf', 'DA_NOP', 'THUC_TAP', '2026-03-06 08:45:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `congty`
--

CREATE TABLE `congty` (
  `cong_ty_id` int(11) NOT NULL,
  `ten_cong_ty` varchar(255) NOT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `ma_so_thue` varchar(255) DEFAULT NULL,
  `nguoi_lien_he` varchar(255) DEFAULT NULL,
  `email_lien_he` varchar(255) DEFAULT NULL,
  `so_dien_thoai_lh` varchar(255) DEFAULT NULL,
  `trang_thai` enum('HOAT_DONG','NGUNG_HOAT_DONG') NOT NULL DEFAULT 'HOAT_DONG'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `congty`
--

INSERT INTO `congty` (`cong_ty_id`, `ten_cong_ty`, `dia_chi`, `ma_so_thue`, `nguoi_lien_he`, `email_lien_he`, `so_dien_thoai_lh`, `trang_thai`) VALUES
(1, 'Công ty TNHH FPT Software HCM', '273 Điện Biên Phủ, Q.3, TP.HCM', '0301463832', 'Lê Anh Kiệt', 'intern@fpt.com.vn', '02836221234', 'HOAT_DONG'),
(2, 'Công ty CP TMA Solutions', '11 Pasteur, Q.1, TP.HCM', '0302150015', 'Nguyễn Thảo', 'intern@tmasolutions.com', '02838221234', 'HOAT_DONG'),
(3, 'Công ty TNHH KMS Technology', '26 Ung Văn Khiêm, Bình Thạnh', '0302151234', 'Trần Minh', 'hr@kms-technology.com', '02835601234', 'HOAT_DONG'),
(4, 'Công ty CP Sài Gòn Technology', '66 Nguyễn Thị Minh Khai, Q.1', '0302155678', 'Phan Hữu Tài', 'intern@saigontech.vn', '02839991234', 'HOAT_DONG'),
(5, 'Công ty TNHH NashTech Vietnam', '9 Đoàn Văn Bơ, Q.4, TP.HCM', '0302160001', 'Lâm Thanh Hải', 'hr@nashtechvietnam.com', '02838881234', 'HOAT_DONG'),
(6, 'Công ty CP Base Enterprise', '48 Tú Xương, Q.3, TP.HCM', '0302161234', 'Ngô Minh Tuấn', 'intern@base.vn', '02833331234', 'HOAT_DONG'),
(7, 'Công ty TNHH Axon Active Vietnam', '29 Phạm Ngọc Thạch, Q.3', '0302162345', 'Đinh Thị Mỹ', 'hr@axonactive.com.vn', '02835551234', 'HOAT_DONG'),
(8, 'Công ty CP Teko Việt Nam', '285 Cách Mạng Tháng 8, Q.10', '0302163456', 'Vũ Minh Hải', 'intern@teko.vn', '02836661234', 'HOAT_DONG'),
(9, 'Công ty TNHH Global CyberSoft', '35 Quang Trung, Q. Gò Vấp', '0302164567', 'Trương Thị Lan', 'career@globalcybersoft.com', '02838771234', 'HOAT_DONG'),
(10, 'Công ty TNHH Haravan', '81 Lê Văn Thịnh, Q.2, TP.HCM', '0302165678', 'Bùi Quốc Tuấn', 'hr@haravan.com', '02836441234', 'HOAT_DONG'),
(11, 'Công ty CP Giải pháp Phần mềm OneSoft', '22 Đinh Bộ Lĩnh, Bình Thạnh', '0302166789', 'Hồ Thị Lan', 'intern@onesoft.vn', '02839441234', 'HOAT_DONG'),
(12, 'Công ty TNHH Zalo', '182 Lê Đại Hành, Q.11, TP.HCM', '0302167890', 'Đỗ Văn Hùng', 'career@zalo.me', '02838661234', 'NGUNG_HOAT_DONG'),
(13, 'Công ty TNHH SynnexFPT', '231 Nguyễn Văn Trỗi, Phú Nhuận', '0302158888', 'Hoàng Kim Phụng', 'hr@synnexfpt.com', '02836001234', 'HOAT_DONG'),
(14, 'Công ty TNHH MTV VNPT TP.HCM', '146 Lê Lợi, Q.1, TP.HCM', '0301551313', 'Vũ Thanh Hải', 'intern@hcm.vnpt.vn', '02838241234', 'HOAT_DONG'),
(15, 'Công ty CP Viettel TP.HCM', '285 Cách Mạng Tháng 8, Q.10', '0301552222', 'Nguyễn Hoài Nam', 'tuyendung@viettel.com.vn', '02836881234', 'HOAT_DONG'),
(16, 'Công ty TNHH CMC Telecom', '109-111 Nguyễn Đình Chiểu, Q.3', '0302159999', 'Lý Văn Phúc', 'hr@cmctelecom.vn', '02835771234', 'HOAT_DONG'),
(17, 'Công ty CP Mắt Bão', '328 Nguyễn Trãi, Q.1, TP.HCM', '0302151111', 'Phạm Thị Tâm', 'intern@matbao.net', '02836991234', 'HOAT_DONG'),
(18, 'Công ty TNHH NetNam', '26 Phùng Khắc Khoan, Q.1, TP.HCM', '0302152222', 'Trần Đức Linh', 'career@netnam.vn', '02838551234', 'HOAT_DONG'),
(19, 'Công ty TNHH HPT Việt Nam', '392 Hai Bà Trưng, Q.3, TP.HCM', '0302153333', 'Mai Thị Hương', 'hr@hpt.vn', '02839661234', 'HOAT_DONG'),
(20, 'Công ty TNHH Cisco Systems Vietnam', '8 Hoàng Diệu 2, TP. Thủ Đức', '0302154444', 'Đặng Văn Bình', 'intern@cisco.com.vn', '02835881234', 'HOAT_DONG');

-- --------------------------------------------------------

--
-- Table structure for table `congtylinhvuc`
--

CREATE TABLE `congtylinhvuc` (
  `cong_ty_id` int(11) NOT NULL,
  `ten_linh_vuc` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `congtylinhvuc`
--

INSERT INTO `congtylinhvuc` (`cong_ty_id`, `ten_linh_vuc`) VALUES
(1, 'Phần mềm'),
(2, 'Phần mềm'),
(3, 'Phần mềm'),
(4, 'Phần mềm'),
(5, 'Phần mềm'),
(6, 'Phần mềm'),
(7, 'Phần mềm'),
(8, 'Phần mềm'),
(9, 'Phần mềm'),
(10, 'Phần mềm'),
(11, 'Phần mềm'),
(12, 'Phần mềm'),
(13, 'Phần cứng'),
(13, 'Phần mềm'),
(14, 'Phần cứng'),
(15, 'Phần cứng'),
(15, 'Phần mềm'),
(16, 'Phần cứng'),
(16, 'Phần mềm'),
(17, 'Phần cứng'),
(18, 'Phần cứng'),
(19, 'Phần cứng'),
(19, 'Phần mềm'),
(20, 'Phần cứng'),
(20, 'Phần mềm');

-- --------------------------------------------------------

--
-- Table structure for table `dangkydetai`
--

CREATE TABLE `dangkydetai` (
  `dang_ky_dt_id` int(11) NOT NULL,
  `nhom_id` int(11) NOT NULL,
  `de_tai_id` int(11) NOT NULL,
  `trang_thai_duyet` enum('CHO_DUYET','DA_DUYET','TU_CHOI') NOT NULL DEFAULT 'CHO_DUYET',
  `ly_do_tu_choi` varchar(255) DEFAULT NULL,
  `ngay_dang_ky` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dangkydetai`
--

INSERT INTO `dangkydetai` (`dang_ky_dt_id`, `nhom_id`, `de_tai_id`, `trang_thai_duyet`, `ly_do_tu_choi`, `ngay_dang_ky`) VALUES
(1, 1, 1, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(2, 2, 2, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(3, 3, 4, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(4, 4, 5, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(5, 5, 6, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(6, 6, 7, 'CHO_DUYET', NULL, '2026-05-23 04:45:13'),
(7, 7, 8, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(8, 8, 9, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(9, 9, 10, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(10, 10, 11, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(11, 11, 12, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(12, 12, 13, 'TU_CHOI', NULL, '2026-05-23 04:45:13'),
(13, 13, 14, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(14, 14, 15, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(15, 15, 16, 'CHO_DUYET', NULL, '2026-05-23 04:45:13'),
(16, 16, 17, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(17, 17, 18, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(18, 18, 19, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(19, 19, 20, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(20, 20, 21, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(21, 21, 22, 'DA_DUYET', NULL, '2026-05-23 04:45:13'),
(22, 22, 23, 'DA_DUYET', NULL, '2026-05-23 04:45:13');

-- --------------------------------------------------------

--
-- Table structure for table `dangkythuctap`
--

CREATE TABLE `dangkythuctap` (
  `dang_ky_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `dot_id` int(11) NOT NULL,
  `cong_ty_id` int(11) DEFAULT NULL,
  `nguoi_huong_dan` varchar(255) DEFAULT NULL,
  `sdt_huong_dan` varchar(255) DEFAULT NULL,
  `vi_tri_thuc_tap` varchar(255) DEFAULT NULL,
  `thoi_gian_thuc_tap` varchar(255) DEFAULT NULL,
  `dia_chi_thuc_tap` varchar(255) DEFAULT NULL,
  `trang_thai` enum('CHO_DUYET','DA_DUYET','TU_CHOI') NOT NULL DEFAULT 'CHO_DUYET'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dangkythuctap`
--

INSERT INTO `dangkythuctap` (`dang_ky_id`, `sinh_vien_id`, `dot_id`, `cong_ty_id`, `nguoi_huong_dan`, `sdt_huong_dan`, `vi_tri_thuc_tap`, `thoi_gian_thuc_tap`, `dia_chi_thuc_tap`, `trang_thai`) VALUES
(1, 1, 1, 1, 'Lê Anh Kiệt', '0901001001', 'Backend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(2, 2, 1, 1, 'Lê Anh Kiệt', '0901001001', 'Frontend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(3, 3, 1, 2, 'Nguyễn Thảo', '0901001002', 'Fullstack Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(4, 4, 1, 2, 'Nguyễn Thảo', '0901001002', 'Frontend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(5, 5, 1, 3, 'Trần Minh', '0901001003', 'Backend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(6, 6, 1, 3, 'Trần Minh', '0901001003', 'Frontend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(7, 7, 1, 4, 'Phan Hữu Tài', '0901001004', 'Web Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(8, 8, 1, 4, 'Phan Hữu Tài', '0901001004', 'Frontend Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(9, 9, 1, 5, 'Lâm Thanh Hải', '0901001005', 'Backend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(10, 10, 1, 5, 'Lâm Thanh Hải', '0901001005', 'Web Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(11, 11, 1, 6, 'Ngô Minh Tuấn', '0901001006', 'Frontend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(12, 12, 1, 6, 'Ngô Minh Tuấn', '0901001006', 'Fullstack Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(13, 13, 1, 7, 'Đinh Thị Mỹ', '0901001007', 'Web Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(14, 14, 1, 7, 'Đinh Thị Mỹ', '0901001007', 'Backend Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(15, 15, 1, 8, 'Vũ Minh Hải', '0901001008', 'Frontend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(16, 16, 1, 8, 'Vũ Minh Hải', '0901001008', 'Web Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(17, 17, 1, 9, 'Trương Thị Lan', '0901001009', 'Web Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(18, 18, 1, 9, 'Trương Thị Lan', '0901001009', 'Fullstack Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(19, 19, 1, 10, 'Bùi Quốc Tuấn', '0901001010', 'Frontend Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(20, 20, 1, 10, 'Bùi Quốc Tuấn', '0901001010', 'Backend Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(21, 21, 1, 11, 'Hồ Thị Lan', '0901001011', 'Web Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(22, 22, 1, 11, 'Hồ Thị Lan', '0901001011', 'Frontend Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(23, 23, 1, 3, 'Trần Minh', '0901001003', 'Mobile Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(24, 24, 1, 4, 'Phan Hữu Tài', '0901001004', 'Mobile Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(25, 25, 1, 7, 'Đinh Thị Mỹ', '0901001007', 'Android Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(26, 26, 1, 8, 'Vũ Minh Hải', '0901001008', 'iOS Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(27, 27, 1, 5, 'Lâm Thanh Hải', '0901001005', 'Flutter Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(28, 28, 1, 9, 'Trương Thị Lan', '0901001009', 'Mobile Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(29, 29, 1, 2, 'Nguyễn Thảo', '0901001002', 'iOS Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(30, 30, 1, 1, 'Lê Anh Kiệt', '0901001001', 'Android Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(31, 31, 1, 6, 'Ngô Minh Tuấn', '0901001006', 'Flutter Developer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(32, 32, 1, 10, 'Bùi Quốc Tuấn', '0901001010', 'Mobile Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(33, 33, 1, 13, 'Hoàng Kim Phụng', '0901001013', 'Network Engineer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(34, 34, 1, 13, 'Hoàng Kim Phụng', '0901001013', 'System Engineer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(35, 35, 1, 14, 'Vũ Thanh Hải', '0901001014', 'Network Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(36, 36, 1, 14, 'Vũ Thanh Hải', '0901001014', 'Network Engineer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(37, 37, 1, 15, 'Nguyễn Hoài Nam', '0901001015', 'System Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(38, 38, 1, 16, 'Lý Văn Phúc', '0901001016', 'Network Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(39, 39, 1, 19, 'Mai Thị Hương', '0901001019', 'System Engineer', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(40, 40, 1, 20, 'Đặng Văn Bình', '0901001020', 'Network Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(41, 41, 1, 13, 'Hoàng Kim Phụng', '0901001013', 'Network Admin Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(42, 42, 1, 14, 'Vũ Thanh Hải', '0901001014', 'Network Admin Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(43, 43, 1, 15, 'Nguyễn Hoài Nam', '0901001015', 'Sysadmin Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(44, 44, 1, 16, 'Lý Văn Phúc', '0901001016', 'Network Admin', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(45, 45, 1, 17, 'Phạm Thị Tâm', '0901001017', 'Sysadmin Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(46, 46, 1, 18, 'Trần Đức Linh', '0901001018', 'Network Admin Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(47, 47, 1, 19, 'Mai Thị Hương', '0901001019', 'Sysadmin Intern', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(48, 48, 1, 20, 'Đặng Văn Bình', '0901001020', 'Network Admin', '12/01-13/03/2026', NULL, 'DA_DUYET'),
(49, 49, 1, 13, 'Hoàng Kim Phụng', '0901001013', 'Network Engineer', '12/01-13/03/2026', NULL, 'DA_DUYET');

-- --------------------------------------------------------

--
-- Table structure for table `detai`
--

CREATE TABLE `detai` (
  `de_tai_id` int(11) NOT NULL,
  `dot_id` int(11) NOT NULL,
  `giang_vien_id` int(11) NOT NULL,
  `ten_de_tai` varchar(255) NOT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `file_mo_ta` varchar(255) DEFAULT NULL,
  `so_luong_sv_toi_da` int(11) DEFAULT NULL,
  `huong_de_tai` enum('PHAN_MEM','MANG_MAY_TINH') NOT NULL,
  `trang_thai` enum('CHO_DUYET','DA_DUYET','TU_CHOI') NOT NULL DEFAULT 'CHO_DUYET',
  `ly_do_tu_choi` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detai`
--

INSERT INTO `detai` (`de_tai_id`, `dot_id`, `giang_vien_id`, `ten_de_tai`, `mo_ta`, `file_mo_ta`, `so_luong_sv_toi_da`, `huong_de_tai`, `trang_thai`, `ly_do_tu_choi`) VALUES
(1, 2, 2, 'Xây dựng hệ thống TMĐT tích hợp thanh toán VNPAY', 'Quản lý sản phẩm, đơn hàng, giỏ hàng, tích hợp VNPAY gateway, gửi email xác nhận', 'dt_d2_01.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(2, 2, 5, 'Ứng dụng quản lý dự án phần mềm theo Agile/Scrum', 'Sprint planning, kanban board, burndown chart, tích hợp Slack notification', 'dt_d2_02.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(3, 2, 7, 'Website học tiếng Anh tích hợp chatbot AI gợi ý bài học', 'Dùng OpenAI API, phân tích lỗi sai, đề xuất bài tập cá nhân hóa', 'dt_d2_03.pdf', 2, 'PHAN_MEM', 'TU_CHOI', 'Phạm vi quá rộng với nhóm 2 người, cần thu hẹp'),
(4, 2, 3, 'App đặt lịch khám bệnh đa nền tảng Android/iOS', 'Quản lý bác sĩ, ca khám, lịch hẹn, nhắc hẹn push notification, hồ sơ bệnh nhân', 'dt_d2_04.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(5, 2, 12, 'Triển khai hạ tầng mạng doanh nghiệp vừa và nhỏ trên GNS3', 'Thiết kế VLAN, OSPF, VPN site-to-site, phân quyền ACL, tài liệu hóa', 'dt_d2_05.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(6, 2, 14, 'Xây dựng hệ thống phát hiện xâm nhập mạng với Snort IDS', 'Cài đặt Snort, viết custom rules, dashboard cảnh báo real-time, báo cáo sự kiện', 'dt_d2_06.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(7, 2, 11, 'Framework kiểm thử tự động giao diện web với Selenium', 'Page Object Model, test report, CI/CD integration với GitHub Actions', 'dt_d2_07.pdf', 2, 'PHAN_MEM', 'CHO_DUYET', NULL),
(8, 2, 15, 'Quản trị hệ thống Windows Server với PowerShell Automation', 'Script tự động hóa quản lý user AD, backup, giám sát sự kiện, gửi alert email', 'dt_d2_08.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(9, 3, 2, 'Hệ thống quản lý bán hàng & phân tích dữ liệu (Nhóm A)', 'Dashboard doanh thu, tồn kho, Chart.js, xuất báo cáo Excel', 'dt_d3_01a.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(10, 3, 2, 'Hệ thống quản lý bán hàng & phân tích dữ liệu (Nhóm B)', 'Phiên bản mở rộng: thêm module CRM, email marketing automation', 'dt_d3_01b.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(11, 3, 5, 'Nền tảng học trực tuyến E-learning', 'Video bài giảng, quiz trắc nghiệm, cấp chứng chỉ PDF, thanh toán Momo', 'dt_d3_02.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(12, 3, 7, 'Hệ thống đặt phòng khách sạn tích hợp bản đồ', 'Google Maps API, quản lý phòng, booking, thanh toán, gửi email QR code', 'dt_d3_03.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(13, 3, 8, 'Xây dựng framework kiểm thử API tự động với Postman/Newman', 'Collection runner, HTML report, tích hợp Jenkins CI, test data driven', 'dt_d3_04.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(14, 3, 9, 'Ứng dụng nhận diện khuôn mặt chấm công bằng AI', 'OpenCV, DeepFace, webcam real-time, báo cáo điểm danh, dashboard admin', 'dt_d3_05.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(15, 3, 3, 'App di động gợi ý sản phẩm dựa trên hành vi người dùng', 'Collaborative filtering, Flutter, Firebase, A/B testing, phân tích click stream', 'dt_d3_06.pdf', 2, 'PHAN_MEM', 'DA_DUYET', NULL),
(16, 3, 11, 'Xây dựng microservices với Docker & Kubernetes', 'Tách monolith thành 3 service, API Gateway, service discovery, health check', 'dt_d3_07.pdf', 2, 'MANG_MAY_TINH', 'CHO_DUYET', NULL),
(17, 3, 12, 'Thiết kế & triển khai mạng campus cho trường học (Nhóm A)', 'VLAN theo khoa, OSPF, WiFi controller, QoS, redundant uplink, tài liệu hóa', 'dt_d3_08a.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(18, 3, 12, 'Thiết kế & triển khai mạng campus cho trường học (Nhóm B)', 'Cùng chủ đề, triển khai thêm IPv6, DNSSEC, network monitoring với Zabbix', 'dt_d3_08b.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(19, 3, 14, 'Xây dựng hệ thống honeypot phát hiện tấn công mạng', 'Honeyd, Cowrie, phân tích log tấn công, dashboard Kibana, báo cáo weekly', 'dt_d3_09.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(20, 3, 12, 'Kiểm tra bảo mật hệ thống mạng nội bộ với Nmap & Nessus', 'Vulnerability scan, pentest cơ bản, báo cáo rủi ro, đề xuất khắc phục', 'dt_d3_10.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(21, 3, 15, 'Tự động hóa quản trị hệ thống Linux với Ansible', 'Playbook triển khai LAMP stack, user management, cron jobs, backup tự động', 'dt_d3_11.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(22, 3, 14, 'Xây dựng hệ thống VPN doanh nghiệp với OpenVPN & pfSense', 'Site-to-site VPN, Road Warrior, certificate management, giám sát kết nối', 'dt_d3_12.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL),
(23, 3, 14, 'Triển khai hệ thống phát hiện xâm nhập IDS với Snort', 'Cài đặt Snort trên Ubuntu, viết custom rules, tích hợp Barnyard2, dashboard cảnh báo real-time', 'dt_d3_13.pdf', 2, 'MANG_MAY_TINH', 'DA_DUYET', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `diembaocao`
--

CREATE TABLE `diembaocao` (
  `diem_bao_cao_id` int(11) NOT NULL,
  `nhom_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `giang_vien_hd_id` int(11) NOT NULL,
  `giang_vien_pb_id` int(11) NOT NULL,
  `diem_gvhd` decimal(10,2) DEFAULT NULL,
  `diem_gvpb` decimal(10,2) DEFAULT NULL,
  `diem_trung_binh` decimal(10,2) DEFAULT NULL,
  `ngay_cap_nhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diembaocao`
--

INSERT INTO `diembaocao` (`diem_bao_cao_id`, `nhom_id`, `sinh_vien_id`, `giang_vien_hd_id`, `giang_vien_pb_id`, `diem_gvhd`, `diem_gvpb`, `diem_trung_binh`, `ngay_cap_nhat`) VALUES
(1, 1, 1, 2, 6, 8.50, 8.00, 8.25, '2026-06-10 05:21:28'),
(2, 2, 7, 5, 6, 8.00, 7.50, 7.75, '2026-06-10 05:21:28'),
(3, 3, 23, 3, 6, 8.30, 7.80, 8.05, '2026-06-10 05:21:28'),
(4, 4, 33, 12, 13, 9.00, 8.50, 8.75, '2026-06-10 05:21:28'),
(6, 7, 41, 15, 13, 8.50, 8.00, 8.25, '2026-06-10 05:21:28');

-- --------------------------------------------------------

--
-- Table structure for table `diemhoidongbaove`
--

CREATE TABLE `diemhoidongbaove` (
  `diem_hd_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `nhom_id` int(11) NOT NULL,
  `giang_vien_id` int(11) NOT NULL,
  `diem_thuyet_trinh` decimal(10,2) NOT NULL DEFAULT 0.00,
  `diem_demo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `diem_van_dap` decimal(10,2) NOT NULL DEFAULT 0.00,
  `diem_bao_ve` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ngay_cham` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diemhoidongbaove`
--

INSERT INTO `diemhoidongbaove` (`diem_hd_id`, `sinh_vien_id`, `nhom_id`, `giang_vien_id`, `diem_thuyet_trinh`, `diem_demo`, `diem_van_dap`, `diem_bao_ve`, `ngay_cham`) VALUES
(1, 1, 1, 10, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(2, 1, 1, 2, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(3, 1, 1, 5, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(4, 1, 1, 3, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(5, 1, 1, 6, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(6, 1, 1, 8, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(7, 2, 1, 10, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(8, 2, 1, 2, 3.00, 4.00, 2.00, 9.00, '2026-05-18 19:00:00'),
(9, 2, 1, 5, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(10, 2, 1, 3, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(11, 2, 1, 6, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(12, 2, 1, 8, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(13, 7, 2, 10, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(14, 7, 2, 2, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(15, 7, 2, 5, 3.00, 4.00, 2.00, 9.00, '2026-05-18 19:00:00'),
(16, 7, 2, 3, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(17, 7, 2, 6, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(18, 7, 2, 8, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(19, 8, 2, 10, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(20, 8, 2, 2, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(21, 8, 2, 5, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(22, 8, 2, 3, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(23, 8, 2, 6, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(24, 8, 2, 8, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(25, 23, 3, 10, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(26, 23, 3, 2, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(27, 23, 3, 5, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(28, 23, 3, 3, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(29, 23, 3, 6, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(30, 23, 3, 8, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(31, 24, 3, 10, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(32, 24, 3, 2, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(33, 24, 3, 5, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(34, 24, 3, 3, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(35, 24, 3, 6, 3.00, 2.00, 2.00, 7.00, '2026-05-18 19:00:00'),
(36, 24, 3, 8, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(37, 33, 4, 17, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(38, 33, 4, 12, 3.00, 4.00, 2.00, 9.00, '2026-05-18 19:00:00'),
(39, 33, 4, 14, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(40, 33, 4, 15, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(41, 33, 4, 13, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(43, 34, 4, 17, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(44, 34, 4, 12, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(45, 34, 4, 14, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(46, 34, 4, 15, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(47, 34, 4, 13, 3.00, 2.50, 2.00, 7.50, '2026-05-18 19:00:00'),
(49, 41, 7, 17, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(50, 41, 7, 12, 3.00, 3.00, 2.00, 8.00, '2026-05-18 19:00:00'),
(51, 41, 7, 14, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(52, 41, 7, 15, 3.00, 4.00, 2.00, 9.00, '2026-05-18 19:00:00'),
(53, 41, 7, 13, 3.00, 3.50, 2.00, 8.50, '2026-05-18 19:00:00'),
(55, 42, 7, 17, 3.00, 1.50, 2.00, 6.50, '2026-05-18 19:00:00'),
(56, 42, 7, 12, 3.00, 2.00, 2.00, 7.00, '2026-05-18 19:00:00'),
(57, 42, 7, 14, 3.00, 1.50, 2.00, 6.50, '2026-05-18 19:00:00'),
(58, 42, 7, 15, 3.00, 2.00, 2.00, 7.00, '2026-05-18 19:00:00'),
(59, 42, 7, 13, 3.00, 1.00, 2.00, 6.00, '2026-05-18 19:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `diemthuctap`
--

CREATE TABLE `diemthuctap` (
  `diem_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `giang_vien_id` int(11) NOT NULL,
  `dot_id` int(11) NOT NULL,
  `diem_so` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diemthuctap`
--

INSERT INTO `diemthuctap` (`diem_id`, `sinh_vien_id`, `giang_vien_id`, `dot_id`, `diem_so`) VALUES
(1, 1, 2, 1, 9.00),
(2, 2, 2, 1, NULL),
(3, 3, 2, 1, NULL),
(4, 4, 2, 1, NULL),
(5, 5, 2, 1, NULL),
(6, 6, 2, 1, NULL),
(7, 7, 5, 1, 8.50),
(8, 8, 5, 1, NULL),
(9, 9, 5, 1, NULL),
(10, 10, 5, 1, NULL),
(11, 11, 5, 1, NULL),
(12, 13, 11, 1, 8.40),
(13, 14, 11, 1, NULL),
(14, 15, 11, 1, NULL),
(15, 16, 11, 1, NULL),
(16, 17, 11, 1, NULL),
(17, 18, 7, 1, NULL),
(18, 19, 7, 1, NULL),
(19, 20, 7, 1, NULL),
(20, 22, 7, 1, NULL),
(21, 23, 3, 1, 8.70),
(22, 24, 3, 1, NULL),
(23, 25, 3, 1, NULL),
(24, 26, 3, 1, NULL),
(25, 27, 3, 1, NULL),
(26, 28, 9, 1, NULL),
(27, 29, 9, 1, NULL),
(28, 30, 9, 1, NULL),
(29, 31, 9, 1, NULL),
(30, 32, 9, 1, NULL),
(31, 33, 12, 1, 9.20),
(32, 34, 12, 1, NULL),
(33, 35, 12, 1, NULL),
(34, 36, 12, 1, NULL),
(35, 37, 14, 1, NULL),
(36, 38, 14, 1, NULL),
(37, 39, 14, 1, NULL),
(38, 40, 14, 1, NULL),
(39, 41, 13, 1, 9.00),
(40, 42, 13, 1, NULL),
(41, 43, 13, 1, NULL),
(42, 44, 13, 1, NULL),
(43, 45, 13, 1, NULL),
(44, 46, 15, 1, NULL),
(45, 47, 15, 1, NULL),
(46, 48, 15, 1, NULL),
(47, 49, 15, 1, NULL),
(48, 12, 5, 1, NULL),
(49, 21, 7, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `diemtongketdatn`
--

CREATE TABLE `diemtongketdatn` (
  `tong_ket_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `nhom_id` int(11) NOT NULL,
  `diem_bao_cao_chung` decimal(10,2) DEFAULT NULL,
  `diem_bao_ve_rieng` decimal(10,2) DEFAULT NULL,
  `diem_tong_ket` decimal(10,2) DEFAULT NULL,
  `trang_thai` enum('DAT','KHONG_DAT') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diemtongketdatn`
--

INSERT INTO `diemtongketdatn` (`tong_ket_id`, `sinh_vien_id`, `nhom_id`, `diem_bao_cao_chung`, `diem_bao_ve_rieng`, `diem_tong_ket`, `trang_thai`) VALUES
(1, 1, 1, 8.25, 8.00, 8.05, 'DAT'),
(2, 2, 1, 8.25, 8.50, 8.45, 'DAT'),
(3, 7, 2, 7.75, 8.42, 8.29, 'DAT'),
(4, 8, 2, 7.75, 7.92, 7.89, 'DAT'),
(5, 23, 3, 8.05, 8.00, 8.01, 'DAT'),
(6, 24, 3, 8.05, 7.50, 7.61, 'DAT'),
(7, 33, 4, 8.75, 8.50, 8.55, 'DAT'),
(8, 34, 4, 8.75, 8.00, 8.15, 'DAT'),
(9, 41, 7, 8.25, 8.50, 8.45, 'DAT'),
(10, 42, 7, 8.25, 6.60, 6.93, 'DAT');

-- --------------------------------------------------------

--
-- Table structure for table `dot`
--

CREATE TABLE `dot` (
  `dot_id` int(11) NOT NULL,
  `giang_vien_id` int(11) DEFAULT NULL,
  `ten_dot` varchar(255) NOT NULL,
  `loai_dot` enum('TTTN','DATN') NOT NULL,
  `hoc_ky` enum('1','2','HE') DEFAULT NULL,
  `nam_hoc` varchar(255) DEFAULT NULL,
  `trang_thai` enum('CHO_MO','DANG_MO','CHAM_DIEM','DA_CONG_BO','DA_DONG') NOT NULL DEFAULT 'CHO_MO',
  `ngay_bat_dau` date DEFAULT NULL,
  `ngay_ket_thuc` date DEFAULT NULL,
  `ngay_bat_dau_dang_ky` date DEFAULT NULL,
  `han_dang_ky` date DEFAULT NULL,
  `han_nop_bao_cao` date DEFAULT NULL,
  `ngay_bat_dau_cham_diem` date DEFAULT NULL,
  `ngay_ket_thuc_cham_diem` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dot`
--

INSERT INTO `dot` (`dot_id`, `giang_vien_id`, `ten_dot`, `loai_dot`, `hoc_ky`, `nam_hoc`, `trang_thai`, `ngay_bat_dau`, `ngay_ket_thuc`, `ngay_bat_dau_dang_ky`, `han_dang_ky`, `han_nop_bao_cao`, `ngay_bat_dau_cham_diem`, `ngay_ket_thuc_cham_diem`) VALUES
(1, 1, 'Thực Tập Tốt Nghiệp – Kỳ 1 2025-2026', 'TTTN', '1', '2025-2026', 'DA_DONG', '2026-01-12', '2026-03-13', '2025-12-15', '2026-01-09', '2026-03-06', '2026-03-16', '2026-04-03'),
(2, 1, 'Đồ Án Tốt Nghiệp – Kỳ 1 2025-2026 (Bổ sung/Phụ)', 'DATN', '1', '2025-2026', 'CHAM_DIEM', '2026-03-02', '2026-04-12', '2026-02-16', '2026-02-27', '2026-04-05', '2026-04-13', '2026-04-24'),
(3, 1, 'Đồ Án Tốt Nghiệp – Kỳ 2 2025-2026 (Chính thức)', 'DATN', '2', '2025-2026', 'CHO_MO', '2026-06-01', '2026-07-12', '2026-03-16', '2026-04-05', '2026-07-05', '2026-07-13', '2026-07-24');

-- --------------------------------------------------------

--
-- Table structure for table `giangvien`
--

CREATE TABLE `giangvien` (
  `giang_vien_id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(10) DEFAULT NULL,
  `gioi_tinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `hoc_vi` varchar(255) DEFAULT NULL,
  `chuyen_mon` varchar(255) DEFAULT NULL,
  `vai_tro` enum('ADMIN','GIANG_VIEN') NOT NULL DEFAULT 'GIANG_VIEN',
  `dang_hoat_dong` tinyint(1) NOT NULL DEFAULT 1,
  `google_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `giangvien`
--

INSERT INTO `giangvien` (`giang_vien_id`, `ho_ten`, `email`, `so_dien_thoai`, `gioi_tinh`, `ngay_sinh`, `hoc_vi`, `chuyen_mon`, `vai_tro`, `dang_hoat_dong`, `google_id`) VALUES
(1, 'Nguyễn Văn Tài', 'tvai@caothang.edu.vn', '0901111001', 'Nam', '1981-03-15', 'ThS', 'Phần mềm', 'ADMIN', 1, NULL),
(2, 'Trần Thị Hoa', 'thoa@caothang.edu.vn', '0901111002', 'Nu', '1985-07-20', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(3, 'Phạm Thị Lan', 'ptlan@caothang.edu.vn', '0901111004', 'Nu', '1983-04-12', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(4, 'Võ Thị Kim Anh', 'vkhanh@caothang.edu.vn', '0901111006', 'Nu', '1987-06-17', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(5, 'Đặng Văn Hùng', 'dvhung@caothang.edu.vn', '0901111007', 'Nam', '1982-02-23', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(6, 'Bùi Thị Ngọc', 'btngocc@caothang.edu.vn', '0901111008', 'Nu', '1986-08-10', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(7, 'Trần Văn Quốc', 'tvquoc@caothang.edu.vn', '0901111010', 'Nam', '1984-05-30', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(8, 'Lý Thị Thanh', 'lttthanh@caothang.edu.vn', '0901111011', 'Nu', '1988-01-14', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(9, 'Phan Thị Mỹ Linh', 'pmlinh@caothang.edu.vn', '0901111013', 'Nu', '1985-03-22', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(10, 'Cao Văn Phong', 'cvphong@caothang.edu.vn', '0901111014', 'Nam', '1977-07-04', 'PGS.TS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(11, 'Đinh Thị Bích', 'dtbich@caothang.edu.vn', '0901111015', 'Nu', '1990-11-19', 'ThS', 'Phần mềm', 'GIANG_VIEN', 1, NULL),
(12, 'Lê Văn Minh', 'lvminh@caothang.edu.vn', '0901111003', 'Nam', '1979-11-05', 'TS', 'Phần cứng', 'GIANG_VIEN', 1, NULL),
(13, 'Hoàng Văn Đức', 'hvduc@caothang.edu.vn', '0901111005', 'Nam', '1980-09-28', 'ThS', 'Phần cứng', 'GIANG_VIEN', 1, NULL),
(14, 'Nguyễn Thành Long', 'ntlong@caothang.edu.vn', '0901111009', 'Nam', '1978-12-01', 'TS', 'Phần cứng', 'GIANG_VIEN', 1, NULL),
(15, 'Mai Văn Sơn', 'mvson@caothang.edu.vn', '0901111012', 'Nam', '1981-10-08', 'ThS', 'Phần cứng', 'GIANG_VIEN', 1, NULL),
(16, 'Hồ Văn Nam', 'hvnam@caothang.edu.vn', '0901111016', 'Nam', '1983-06-25', 'ThS', 'Phần cứng', 'GIANG_VIEN', 0, NULL),
(17, 'Trần Văn Hải', 'tvhai@caothang.edu.vn', '0901111017', 'Nam', '1982-05-12', 'ThS', 'Phần cứng', 'GIANG_VIEN', 1, NULL),
(19, 'Trần Thị Trà (Cập Nhật Thử Nghiệm)', 'tra.tt@caothang.edu.vn', '0912345678', 'Nu', '1990-01-01', 'Thạc sĩ', 'Lập trình ứng dụng Web Laravel & QC', 'GIANG_VIEN', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `hoidong`
--

CREATE TABLE `hoidong` (
  `hoi_dong_id` int(11) NOT NULL,
  `dot_id` int(11) NOT NULL,
  `ten_hoi_dong` varchar(255) NOT NULL,
  `ngay_bao_ve` date DEFAULT NULL,
  `gio_bao_ve` varchar(255) DEFAULT NULL,
  `phong_bao_ve` varchar(255) DEFAULT NULL,
  `trang_thai` enum('NHAP','DA_CONG_BO','DANG_DIEN_RA','DA_KET_THUC') NOT NULL DEFAULT 'NHAP'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoidong`
--

INSERT INTO `hoidong` (`hoi_dong_id`, `dot_id`, `ten_hoi_dong`, `ngay_bao_ve`, `gio_bao_ve`, `phong_bao_ve`, `trang_thai`) VALUES
(1, 2, 'Hội Đồng 1 – Phần Mềm (WEB & DD)', '2026-05-18', '08:00', 'A201', 'DA_KET_THUC'),
(2, 2, 'Hội Đồng 2 – Phần Cứng & Mạng Máy Tính', '2026-05-18', '13:30', 'A202', 'DA_KET_THUC');

-- --------------------------------------------------------

--
-- Table structure for table `lichbaove`
--

CREATE TABLE `lichbaove` (
  `lich_id` int(11) NOT NULL,
  `hoi_dong_id` int(11) NOT NULL,
  `nhom_id` int(11) NOT NULL,
  `thoi_gian_bat_dau` time DEFAULT NULL,
  `thu_tu` int(11) DEFAULT NULL,
  `ghi_chu` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lichbaove`
--

INSERT INTO `lichbaove` (`lich_id`, `hoi_dong_id`, `nhom_id`, `thoi_gian_bat_dau`, `thu_tu`, `ghi_chu`) VALUES
(1, 1, 1, NULL, 1, 'Migration data'),
(2, 1, 2, NULL, 2, 'Migration data'),
(3, 1, 3, NULL, 3, 'Migration data'),
(4, 2, 4, NULL, 1, 'Migration data'),
(5, 2, 7, NULL, 2, 'Migration data');

-- --------------------------------------------------------

--
-- Table structure for table `loimoinhom`
--

CREATE TABLE `loimoinhom` (
  `loi_moi_id` int(11) NOT NULL,
  `nhom_id` int(11) NOT NULL,
  `sinh_vien_duoc_moi_id` int(11) NOT NULL,
  `trang_thai_xac_nhan` enum('CHO_XAC_NHAN','DA_CHAP_NHAN','TU_CHOI') NOT NULL DEFAULT 'CHO_XAC_NHAN',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loimoinhom`
--

INSERT INTO `loimoinhom` (`loi_moi_id`, `nhom_id`, `sinh_vien_duoc_moi_id`, `trang_thai_xac_nhan`, `ngay_tao`) VALUES
(1, 1, 2, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(2, 2, 8, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(3, 3, 24, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(4, 4, 34, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(5, 5, 38, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(6, 6, 14, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(7, 7, 42, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(8, 8, 4, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(9, 9, 6, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(10, 10, 10, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(11, 11, 16, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(12, 13, 26, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(13, 14, 30, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(14, 15, 22, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(15, 16, 36, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(16, 17, 40, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(17, 18, 44, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(18, 19, 46, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(19, 20, 48, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(20, 21, 37, 'DA_CHAP_NHAN', '2026-05-22 17:28:35'),
(21, 12, 20, 'TU_CHOI', '2026-05-22 17:28:35'),
(22, 22, 11, 'CHO_XAC_NHAN', '2026-05-22 17:28:35'),
(23, 22, 12, 'CHO_XAC_NHAN', '2026-05-22 17:28:35'),
(24, 22, 21, 'CHO_XAC_NHAN', '2026-05-22 17:28:35');

-- --------------------------------------------------------

--
-- Table structure for table `lop`
--

CREATE TABLE `lop` (
  `lop_id` int(11) NOT NULL,
  `ten_lop` varchar(255) NOT NULL,
  `bac_dao_tao` enum('CAO_DANG','CAO_DANG_NGHE') DEFAULT NULL,
  `khoa_hoc` varchar(255) DEFAULT NULL,
  `chuyen_nganh` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lop`
--

INSERT INTO `lop` (`lop_id`, `ten_lop`, `bac_dao_tao`, `khoa_hoc`, `chuyen_nganh`) VALUES
(1, 'CĐTH23WEBA', 'CAO_DANG', '2023', 'Lập trình Web'),
(2, 'CĐTH23WEBB', 'CAO_DANG', '2023', 'Lập trình Web'),
(3, 'CĐTH23DDA', 'CAO_DANG', '2023', 'Lập trình Di động'),
(4, 'CĐTH23MMTA', 'CAO_DANG', '2023', 'Mạng Máy Tính'),
(5, 'CĐN23QTMA', 'CAO_DANG_NGHE', '2023', 'Quản Trị Mạng');

-- --------------------------------------------------------

--
-- Table structure for table `nhanxetbaocao`
--

CREATE TABLE `nhanxetbaocao` (
  `nhan_xet_id` int(11) NOT NULL,
  `bao_cao_id` int(11) NOT NULL,
  `giang_vien_id` int(11) NOT NULL,
  `noi_dung` varchar(255) DEFAULT NULL,
  `danh_gia` enum('DAT','CHUA_DAT') DEFAULT NULL,
  `loai_nhan_xet` enum('DO_AN','THUC_TAP') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nhanxetbaocao`
--

INSERT INTO `nhanxetbaocao` (`nhan_xet_id`, `bao_cao_id`, `giang_vien_id`, `noi_dung`, `danh_gia`, `loai_nhan_xet`) VALUES
(1, 1, 2, 'Báo cáo đầy đủ, tìm hiểu nhanh quy trình làm việc', 'DAT', 'THUC_TAP'),
(2, 2, 2, 'Tích cực fix bug, ghi chép chi tiết', 'DAT', 'THUC_TAP'),
(3, 3, 2, 'Viết unit test tốt, coverage đạt 80%', 'DAT', 'THUC_TAP'),
(4, 4, 2, 'Hoàn thành tính năng đúng deadline', 'DAT', 'THUC_TAP'),
(5, 5, 2, 'Tham gia sprint review, đặt câu hỏi chủ động', 'DAT', 'THUC_TAP'),
(6, 6, 2, 'Module email hoàn chỉnh, test E2E pass', 'DAT', 'THUC_TAP'),
(7, 7, 2, 'Tối ưu query tốt, thể hiện tư duy kỹ thuật', 'DAT', 'THUC_TAP'),
(8, 8, 2, 'Báo cáo tổng kết đầy đủ, code sạch', 'DAT', 'THUC_TAP'),
(9, 9, 2, 'Nắm bắt React nhanh, code UI gọn', 'DAT', 'THUC_TAP'),
(10, 10, 2, 'Component đẹp, có tái sử dụng', 'DAT', 'THUC_TAP'),
(11, 11, 2, 'Nộp trễ 3 ngày, cần cải thiện kỷ luật', 'CHUA_DAT', 'THUC_TAP'),
(12, 12, 2, 'Dashboard hoàn chỉnh, UX tốt', 'DAT', 'THUC_TAP'),
(13, 13, 2, 'Fix responsive tốt, kỹ năng debug tiến bộ', 'DAT', 'THUC_TAP'),
(14, 14, 2, 'Nắm vững NodeJS cơ bản', 'DAT', 'THUC_TAP'),
(15, 15, 2, 'CRUD API hoàn chỉnh, đúng convention', 'DAT', 'THUC_TAP'),
(16, 16, 2, 'Nộp trễ, JWT implement chưa bảo mật đủ', 'CHUA_DAT', 'THUC_TAP'),
(17, 17, 5, 'Hiểu nghiệp vụ bán hàng, phân tích tốt', 'DAT', 'THUC_TAP'),
(18, 18, 5, 'API module sản phẩm đầy đủ', 'DAT', 'THUC_TAP'),
(19, 19, 5, 'Tích hợp thanh toán thành công', 'DAT', 'THUC_TAP'),
(20, 20, 5, 'Elasticsearch implement hiệu quả', 'DAT', 'THUC_TAP'),
(21, 21, 5, 'Deploy thành công, nginx cấu hình đúng', 'DAT', 'THUC_TAP'),
(22, 22, 5, 'Test coverage 75%, đạt yêu cầu', 'DAT', 'THUC_TAP'),
(23, 23, 5, 'Query tối ưu tốt, hiệu suất cải thiện rõ', 'DAT', 'THUC_TAP'),
(24, 24, 5, 'Tài liệu kỹ thuật chi tiết, demo thuyết phục', 'DAT', 'THUC_TAP'),
(25, 25, 11, 'Hiểu TypeScript, code có type safety', 'DAT', 'THUC_TAP'),
(26, 26, 11, 'Component tái sử dụng tốt', 'DAT', 'THUC_TAP'),
(27, 27, 11, 'Nộp trễ, Dashboard còn thiếu một số biểu đồ', 'CHUA_DAT', 'THUC_TAP'),
(28, 28, 11, 'API tích hợp đúng, pagination hoạt động', 'DAT', 'THUC_TAP'),
(29, 29, 11, 'Form quản lý hoàn chỉnh', 'DAT', 'THUC_TAP'),
(30, 30, 11, 'Storybook tốt, documentation rõ ràng', 'DAT', 'THUC_TAP'),
(31, 31, 3, 'Flutter/Dart nắm vững cơ bản', 'DAT', 'THUC_TAP'),
(32, 32, 3, 'UI đẹp, đúng design system', 'DAT', 'THUC_TAP'),
(33, 33, 3, 'State management rõ ràng, API tích hợp tốt', 'DAT', 'THUC_TAP'),
(34, 34, 3, 'Push notification hoạt động đúng', 'DAT', 'THUC_TAP'),
(35, 35, 3, 'Màn hình sản phẩm UX tốt', 'DAT', 'THUC_TAP'),
(36, 36, 3, 'Tích hợp MoMo SDK thành công', 'DAT', 'THUC_TAP'),
(37, 37, 3, 'Test trên nhiều thiết bị, fix UI responsive', 'DAT', 'THUC_TAP'),
(38, 38, 3, 'APK build thành công, hướng dẫn rõ ràng', 'DAT', 'THUC_TAP'),
(39, 39, 12, 'Hiểu topology mạng, ghi chú đầy đủ', 'DAT', 'THUC_TAP'),
(40, 40, 12, 'Cấu hình VLAN đúng, kiểm tra kết nối thành công', 'DAT', 'THUC_TAP'),
(41, 41, 12, 'Inter-VLAN routing hoạt động chính xác', 'DAT', 'THUC_TAP'),
(42, 42, 12, 'OSPF convergence tốt', 'DAT', 'THUC_TAP'),
(43, 43, 12, 'ACL triển khai đúng policy', 'DAT', 'THUC_TAP'),
(44, 44, 12, 'Nagios cài đặt thành công, alert hoạt động', 'DAT', 'THUC_TAP'),
(45, 45, 12, 'Xử lý sự cố thực tế tốt, tự tin', 'DAT', 'THUC_TAP'),
(46, 46, 12, 'Báo cáo tổng kết chi tiết, topology vẽ đẹp', 'DAT', 'THUC_TAP'),
(47, 47, 12, 'Hiểu cơ bản về thiết bị mạng', 'DAT', 'THUC_TAP'),
(48, 48, 12, 'Nộp trễ, VLAN cấu hình còn lỗi', 'CHUA_DAT', 'THUC_TAP'),
(49, 49, 12, 'Hỗ trợ sự cố ổn', 'DAT', 'THUC_TAP'),
(50, 50, 12, 'pfSense cấu hình cơ bản đạt', 'DAT', 'THUC_TAP'),
(51, 51, 13, 'Cài đặt Windows Server thành công', 'DAT', 'THUC_TAP'),
(52, 52, 13, 'Active Directory cấu hình đúng', 'DAT', 'THUC_TAP'),
(53, 53, 13, 'Group Policy áp dụng hiệu quả', 'DAT', 'THUC_TAP'),
(54, 54, 13, 'DNS/DHCP hoạt động ổn định', 'DAT', 'THUC_TAP'),
(55, 55, 13, 'IIS host ứng dụng thành công', 'DAT', 'THUC_TAP'),
(56, 56, 13, 'Backup/restore test thành công', 'DAT', 'THUC_TAP'),
(57, 57, 13, 'Giám sát hiệu suất đúng phương pháp', 'DAT', 'THUC_TAP'),
(58, 58, 13, 'Quy trình vận hành chi tiết, chuyên nghiệp', 'DAT', 'THUC_TAP'),
(59, 59, 13, 'Tìm hiểu cơ bản, chưa thực hành nhiều', 'CHUA_DAT', 'THUC_TAP'),
(60, 60, 13, 'Nộp trễ, chỉ hỗ trợ văn phòng chưa học kỹ thuật', 'CHUA_DAT', 'THUC_TAP'),
(61, 61, 2, 'Phân tích yêu cầu và thiết kế ERD chi tiết, logic rõ ràng', 'DAT', 'DO_AN'),
(62, 62, 2, 'Xây dựng backend API auth, product, cart ổn định và chuẩn', 'DAT', 'DO_AN'),
(64, 64, 2, 'Hoàn thiện frontend, fix bug và viết tài liệu đầy đủ', 'DAT', 'DO_AN'),
(67, 67, 2, 'Tích hợp API và quản lý state với Redux Toolkit hiệu quả', 'DAT', 'DO_AN'),
(69, 69, 5, 'Phân tích Agile workflow và thiết kế database cho quản lý sprint/task tốt', 'DAT', 'DO_AN'),
(71, 71, 5, 'Implement kanban board drag-drop mượt mà, tích hợp Slack thông minh', 'DAT', 'DO_AN'),
(73, 73, 5, 'Sử dụng dnd-kit để xây dựng frontend kanban board hiệu quả', 'DAT', 'DO_AN'),
(74, 74, 3, 'Phác thảo wireframe và thiết kế database cho app đặt lịch khám bệnh hợp lý', 'DAT', 'DO_AN'),
(75, 75, 3, 'Xây dựng UI Flutter đẹp, màn hình đăng nhập và danh sách bác sĩ rõ ràng', 'DAT', 'DO_AN'),
(76, 76, 3, 'Tích hợp API đặt lịch và cấu hình FCM notification hoạt động tốt', 'DAT', 'DO_AN'),
(77, 77, 3, 'Test toàn bộ flow, fix bug và build release APK thành công', 'DAT', 'DO_AN'),
(78, 78, 12, 'Thiết kế topology mạng doanh nghiệp vừa trên GNS3 chi tiết', 'DAT', 'DO_AN'),
(79, 79, 12, 'Cấu hình VLAN, trunk port và inter-VLAN routing chính xác', 'DAT', 'DO_AN'),
(80, 80, 12, 'Triển khai OSPF, VPN site-to-site và ACL policy tốt', 'DAT', 'DO_AN'),
(81, 81, 12, 'Test hệ thống và viết tài liệu kỹ thuật đầy đủ, chuyên nghiệp', 'DAT', 'DO_AN'),
(82, 84, 15, 'Phân tích yêu cầu và thiết kế script quản trị Active Directory rõ ràng', 'DAT', 'DO_AN'),
(83, 85, 15, 'Viết PowerShell script tạo/xóa user hàng loạt hiệu quả', 'DAT', 'DO_AN'),
(84, 86, 15, 'Script backup tự động và gửi email alert hoạt động ổn định', 'DAT', 'DO_AN'),
(85, 87, 15, 'Test script toàn diện và viết documentation chi tiết', 'DAT', 'DO_AN'),
(86, 82, 14, 'Sơ đồ Snort rules viết sai hoàn toàn cú pháp, yêu cầu làm lại', 'CHUA_DAT', 'DO_AN'),
(87, 83, 14, 'Tiến độ quá chậm, dashboard chưa có tính năng real-time như cam kết', 'CHUA_DAT', 'DO_AN');

-- --------------------------------------------------------

--
-- Table structure for table `nhomsvda`
--

CREATE TABLE `nhomsvda` (
  `nhom_id` int(11) NOT NULL,
  `de_tai_id` int(11) DEFAULT NULL,
  `dot_id` int(11) NOT NULL,
  `hoi_dong_id` int(11) DEFAULT NULL,
  `trang_thai_nhom` enum('MOI_TAO','DU_THANH_VIEN') NOT NULL DEFAULT 'MOI_TAO',
  `trang_thai_duyet` enum('CHUA_DANG_KY','CHO_DUYET','DA_DUYET','TU_CHOI') NOT NULL DEFAULT 'CHUA_DANG_KY',
  `ket_qua_huong_dan` enum('DAT','KHONG_DAT') DEFAULT NULL,
  `nhan_xet_phan_bien` varchar(255) DEFAULT NULL,
  `ket_qua_phan_bien` enum('DAT','KHONG_DAT') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nhomsvda`
--

INSERT INTO `nhomsvda` (`nhom_id`, `de_tai_id`, `dot_id`, `hoi_dong_id`, `trang_thai_nhom`, `trang_thai_duyet`, `ket_qua_huong_dan`, `nhan_xet_phan_bien`, `ket_qua_phan_bien`) VALUES
(1, 1, 2, 1, 'DU_THANH_VIEN', 'DA_DUYET', 'DAT', 'Hệ thống TMĐT hoàn chỉnh, tích hợp VNPAY thành công', 'DAT'),
(2, 2, 2, 1, 'DU_THANH_VIEN', 'DA_DUYET', 'DAT', 'Kanban board hoàn chỉnh, burndown chart chính xác', 'DAT'),
(3, 4, 2, 1, 'DU_THANH_VIEN', 'DA_DUYET', 'DAT', 'App đặt lịch chạy tốt Android, push notification hoạt động', 'DAT'),
(4, 5, 2, 2, 'DU_THANH_VIEN', 'DA_DUYET', 'DAT', 'Topology hoàn chỉnh, OSPF hội tụ đúng, VPN site-to-site OK', 'DAT'),
(5, 6, 2, NULL, 'DU_THANH_VIEN', 'DA_DUYET', 'KHONG_DAT', 'Snort rules còn thiếu, dashboard chưa real-time', 'KHONG_DAT'),
(6, 7, 2, NULL, 'DU_THANH_VIEN', 'CHO_DUYET', NULL, NULL, NULL),
(7, 8, 2, 2, 'DU_THANH_VIEN', 'DA_DUYET', 'DAT', 'Script PowerShell hoạt động, backup tự động đạt yêu cầu', 'DAT'),
(8, 9, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(9, 10, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(10, 11, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(11, 12, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(12, 13, 3, NULL, 'DU_THANH_VIEN', 'TU_CHOI', NULL, NULL, NULL),
(13, 14, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(14, 15, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(15, 16, 3, NULL, 'DU_THANH_VIEN', 'CHO_DUYET', NULL, NULL, NULL),
(16, 17, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(17, 18, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(18, 19, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(19, 20, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(20, 21, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(21, 22, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(22, 23, 3, NULL, 'DU_THANH_VIEN', 'DA_DUYET', NULL, NULL, NULL),
(101, NULL, 2, NULL, 'DU_THANH_VIEN', 'CHUA_DANG_KY', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `phanconghdtt`
--

CREATE TABLE `phanconghdtt` (
  `phan_cong_hd_id` int(11) NOT NULL,
  `giang_vien_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `dot_id` int(11) NOT NULL,
  `da_cong_bo` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `phanconghdtt`
--

INSERT INTO `phanconghdtt` (`phan_cong_hd_id`, `giang_vien_id`, `sinh_vien_id`, `dot_id`, `da_cong_bo`) VALUES
(1, 2, 1, 1, 1),
(2, 2, 2, 1, 1),
(3, 2, 3, 1, 1),
(4, 2, 4, 1, 1),
(5, 2, 5, 1, 1),
(6, 2, 6, 1, 1),
(7, 5, 7, 1, 1),
(8, 5, 8, 1, 1),
(9, 5, 9, 1, 1),
(10, 5, 10, 1, 1),
(11, 5, 11, 1, 1),
(12, 5, 12, 1, 1),
(13, 11, 13, 1, 1),
(14, 11, 14, 1, 1),
(15, 11, 15, 1, 1),
(16, 11, 16, 1, 1),
(17, 11, 17, 1, 1),
(18, 7, 18, 1, 1),
(19, 7, 19, 1, 1),
(20, 7, 20, 1, 1),
(21, 7, 21, 1, 1),
(22, 7, 22, 1, 1),
(23, 3, 23, 1, 1),
(24, 3, 24, 1, 1),
(25, 3, 25, 1, 1),
(26, 3, 26, 1, 1),
(27, 3, 27, 1, 1),
(28, 9, 28, 1, 1),
(29, 9, 29, 1, 1),
(30, 9, 30, 1, 1),
(31, 9, 31, 1, 1),
(32, 9, 32, 1, 1),
(33, 12, 33, 1, 1),
(34, 12, 34, 1, 1),
(35, 12, 35, 1, 1),
(36, 12, 36, 1, 1),
(37, 14, 37, 1, 1),
(38, 14, 38, 1, 1),
(39, 14, 39, 1, 1),
(40, 14, 40, 1, 1),
(41, 13, 41, 1, 1),
(42, 13, 42, 1, 1),
(43, 13, 43, 1, 1),
(44, 13, 44, 1, 1),
(45, 13, 45, 1, 1),
(46, 15, 46, 1, 1),
(47, 15, 47, 1, 1),
(48, 15, 48, 1, 1),
(49, 15, 49, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `sinhvien`
--

CREATE TABLE `sinhvien` (
  `sinh_vien_id` int(11) NOT NULL,
  `ma_so_sinh_vien` varchar(10) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(10) DEFAULT NULL,
  `gioi_tinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `lop_id` int(11) DEFAULT NULL,
  `dang_hoat_dong` tinyint(1) NOT NULL DEFAULT 1,
  `google_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sinhvien`
--

INSERT INTO `sinhvien` (`sinh_vien_id`, `ma_so_sinh_vien`, `ho_ten`, `email`, `so_dien_thoai`, `gioi_tinh`, `ngay_sinh`, `lop_id`, `dang_hoat_dong`, `google_id`) VALUES
(1, '0306231001', 'Nguyễn Minh Khoa', '0306231001@caothang.edu.vn', '0911001001', 'Nam', '2004-01-15', 1, 1, NULL),
(2, '0306231002', 'Trần Thị Bảo Châu', '0306231002@caothang.edu.vn', '0911001002', 'Nu', '2004-03-22', 1, 1, NULL),
(3, '0306231003', 'Lê Quốc Huy', '0306231003@caothang.edu.vn', '0911001003', 'Nam', '2003-07-10', 1, 1, NULL),
(4, '0306231004', 'Phạm Thị Thu Hằng', '0306231004@caothang.edu.vn', '0911001004', 'Nu', '2004-05-08', 1, 1, NULL),
(5, '0306231005', 'Hoàng Văn Tuấn', '0306231005@caothang.edu.vn', '0911001005', 'Nam', '2003-11-30', 1, 1, NULL),
(6, '0306231006', 'Võ Thị Cẩm Ly', '0306231006@caothang.edu.vn', '0911001006', 'Nu', '2004-02-14', 1, 1, NULL),
(7, '0306231007', 'Đặng Văn Tín', '0306231007@caothang.edu.vn', '0911001007', 'Nam', '2003-09-05', 1, 1, NULL),
(8, '0306231008', 'Bùi Thị Diễm', '0306231008@caothang.edu.vn', '0911001008', 'Nu', '2004-06-20', 1, 1, NULL),
(9, '0306231009', 'Nguyễn Thanh Phong', '0306231009@caothang.edu.vn', '0911001009', 'Nam', '2003-04-17', 1, 1, NULL),
(10, '0306231010', 'Trần Ngọc Bảo', '0306231010@caothang.edu.vn', '0911001010', 'Nam', '2004-08-03', 1, 1, NULL),
(11, '0306231011', 'Lý Thị Hồng Nhung', '0306231011@caothang.edu.vn', '0911001011', 'Nu', '2003-12-25', 1, 1, NULL),
(12, '0306231012', 'Phan Minh Đức', '0306231012@caothang.edu.vn', '0911001012', 'Nam', '2004-10-11', 1, 1, NULL),
(13, '0306231013', 'Mai Thị Kiều Oanh', '0306231013@caothang.edu.vn', '0911001013', 'Nu', '2004-01-09', 2, 1, NULL),
(14, '0306231014', 'Cao Văn Hải', '0306231014@caothang.edu.vn', '0911001014', 'Nam', '2003-03-28', 2, 1, NULL),
(15, '0306231015', 'Đinh Thị Quỳnh', '0306231015@caothang.edu.vn', '0911001015', 'Nu', '2004-07-16', 2, 1, NULL),
(16, '0306231016', 'Hồ Văn Khải', '0306231016@caothang.edu.vn', '0911001016', 'Nam', '2003-06-01', 2, 1, NULL),
(17, '0306231017', 'Lê Thị Mỹ Duyên', '0306231017@caothang.edu.vn', '0911001017', 'Nu', '2004-09-13', 2, 1, NULL),
(18, '0306231018', 'Nguyễn Đức Thịnh', '0306231018@caothang.edu.vn', '0911001018', 'Nam', '2003-02-07', 2, 1, NULL),
(19, '0306231019', 'Trần Thị Ngân Hà', '0306231019@caothang.edu.vn', '0911001019', 'Nu', '2004-11-24', 2, 1, NULL),
(20, '0306231020', 'Phạm Văn Long', '0306231020@caothang.edu.vn', '0911001020', 'Nam', '2003-05-19', 2, 1, NULL),
(21, '0306231021', 'Võ Minh Hiếu', '0306231021@caothang.edu.vn', '0911001021', 'Nam', '2004-04-02', 2, 1, NULL),
(22, '0306231022', 'Đặng Thị Bích Ngọc', '0306231022@caothang.edu.vn', '0911001022', 'Nu', '2003-10-18', 2, 1, NULL),
(23, '0306231023', 'Bùi Văn Quân', '0306231023@caothang.edu.vn', '0911001023', 'Nam', '2004-08-27', 3, 1, NULL),
(24, '0306231024', 'Nguyễn Thị Thúy', '0306231024@caothang.edu.vn', '0911001024', 'Nu', '2003-01-14', 3, 1, NULL),
(25, '0306231025', 'Lê Hoàng Phúc', '0306231025@caothang.edu.vn', '0911001025', 'Nam', '2004-03-06', 3, 1, NULL),
(26, '0306231026', 'Trần Văn Đạt', '0306231026@caothang.edu.vn', '0911001026', 'Nam', '2003-07-22', 3, 1, NULL),
(27, '0306231027', 'Phan Thị Tuyết', '0306231027@caothang.edu.vn', '0911001027', 'Nu', '2004-05-31', 3, 1, NULL),
(28, '0306231028', 'Hoàng Minh Tâm', '0306231028@caothang.edu.vn', '0911001028', 'Nam', '2003-09-16', 3, 1, NULL),
(29, '0306231029', 'Võ Thị Thu Trang', '0306231029@caothang.edu.vn', '0911001029', 'Nu', '2004-12-04', 3, 1, NULL),
(30, '0306231030', 'Đinh Văn Toàn', '0306231030@caothang.edu.vn', '0911001030', 'Nam', '2003-04-09', 3, 1, NULL),
(31, '0306231031', 'Mai Thị Phương', '0306231031@caothang.edu.vn', '0911001031', 'Nu', '2004-02-21', 3, 1, NULL),
(32, '0306231032', 'Lý Văn Thuận', '0306231032@caothang.edu.vn', '0911001032', 'Nam', '2003-11-08', 3, 1, NULL),
(33, '0306231033', 'Cao Thị Hương', '0306231033@caothang.edu.vn', '0911001033', 'Nu', '2004-06-15', 4, 1, NULL),
(34, '0306231034', 'Hồ Văn Lộc', '0306231034@caothang.edu.vn', '0911001034', 'Nam', '2003-08-29', 4, 1, NULL),
(35, '0306231035', 'Nguyễn Thị Bình', '0306231035@caothang.edu.vn', '0911001035', 'Nu', '2004-10-07', 4, 1, NULL),
(36, '0306231036', 'Trần Văn Khánh', '0306231036@caothang.edu.vn', '0911001036', 'Nam', '2003-03-17', 4, 1, NULL),
(37, '0306231037', 'Phạm Thị Hà', '0306231037@caothang.edu.vn', '0911001037', 'Nu', '2004-01-26', 4, 1, NULL),
(38, '0306231038', 'Lê Văn Tùng', '0306231038@caothang.edu.vn', '0911001038', 'Nam', '2003-12-14', 4, 1, NULL),
(39, '0306231039', 'Đặng Thị Vân', '0306231039@caothang.edu.vn', '0911001039', 'Nu', '2004-07-03', 4, 1, NULL),
(40, '0306231040', 'Bùi Văn Cường', '0306231040@caothang.edu.vn', '0911001040', 'Nam', '2003-05-11', 4, 1, NULL),
(41, '0406231041', 'Nguyễn Văn Bảo', '0406231041@caothang.edu.vn', '0911001041', 'Nam', '2004-04-20', 5, 1, NULL),
(42, '0406231042', 'Trần Thị Kim Chi', '0406231042@caothang.edu.vn', '0911001042', 'Nu', '2003-06-08', 5, 1, NULL),
(43, '0406231043', 'Lê Văn Hòa', '0406231043@caothang.edu.vn', '0911001043', 'Nam', '2004-09-24', 5, 1, NULL),
(44, '0406231044', 'Phạm Thị Ngọc Trâm', '0406231044@caothang.edu.vn', '0911001044', 'Nu', '2003-02-12', 5, 1, NULL),
(45, '0406231045', 'Hoàng Văn An', '0406231045@caothang.edu.vn', '0911001045', 'Nam', '2004-11-01', 5, 1, NULL),
(46, '0406231046', 'Võ Thị Lan Anh', '0406231046@caothang.edu.vn', '0911001046', 'Nu', '2003-08-19', 5, 1, NULL),
(47, '0406231047', 'Đặng Văn Khoa', '0406231047@caothang.edu.vn', '0911001047', 'Nam', '2004-03-27', 5, 1, NULL),
(48, '0406231048', 'Bùi Thị Mỹ Hạnh', '0406231048@caothang.edu.vn', '0911001048', 'Nu', '2003-10-05', 5, 1, NULL),
(49, '0406231049', 'Nguyễn Thành Đạt', '0406231049@caothang.edu.vn', '0911001049', 'Nam', '2004-06-13', 5, 1, NULL),
(50, '0406231050', 'Trần Văn Sinh', '0406231050@caothang.edu.vn', '0911001050', 'Nam', '2003-01-30', 5, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `thanhvienhoidong`
--

CREATE TABLE `thanhvienhoidong` (
  `thanh_vien_hd_id` int(11) NOT NULL,
  `hoi_dong_id` int(11) NOT NULL,
  `giang_vien_id` int(11) NOT NULL,
  `vai_tro` enum('CHU_TICH','PHAN_BIEN','UY_VIEN') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thanhvienhoidong`
--

INSERT INTO `thanhvienhoidong` (`thanh_vien_hd_id`, `hoi_dong_id`, `giang_vien_id`, `vai_tro`) VALUES
(1, 1, 10, 'CHU_TICH'),
(2, 1, 2, 'UY_VIEN'),
(3, 1, 5, 'UY_VIEN'),
(4, 1, 3, 'UY_VIEN'),
(5, 1, 6, 'PHAN_BIEN'),
(6, 1, 8, 'UY_VIEN'),
(8, 2, 12, 'UY_VIEN'),
(9, 2, 14, 'CHU_TICH'),
(10, 2, 15, 'UY_VIEN'),
(11, 2, 13, 'PHAN_BIEN'),
(20, 2, 17, 'UY_VIEN');

-- --------------------------------------------------------

--
-- Table structure for table `thanhviennhom`
--

CREATE TABLE `thanhviennhom` (
  `thanh_vien_id` int(11) NOT NULL,
  `nhom_id` int(11) NOT NULL,
  `sinh_vien_id` int(11) NOT NULL,
  `la_truong_nhom` tinyint(1) NOT NULL DEFAULT 0,
  `dieu_kien_lam_do_an` enum('DAT','CHUA_DAT') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thanhviennhom`
--

INSERT INTO `thanhviennhom` (`thanh_vien_id`, `nhom_id`, `sinh_vien_id`, `la_truong_nhom`, `dieu_kien_lam_do_an`) VALUES
(1, 1, 1, 1, 'DAT'),
(2, 1, 2, 0, 'DAT'),
(3, 2, 7, 1, 'DAT'),
(4, 2, 8, 0, 'DAT'),
(5, 3, 23, 1, 'DAT'),
(6, 3, 24, 0, 'DAT'),
(7, 4, 33, 1, 'DAT'),
(8, 4, 34, 0, 'DAT'),
(9, 5, 37, 1, 'DAT'),
(10, 5, 38, 0, 'DAT'),
(11, 6, 13, 1, NULL),
(12, 6, 14, 0, NULL),
(13, 7, 41, 1, 'DAT'),
(14, 7, 42, 0, 'DAT'),
(15, 8, 3, 1, 'DAT'),
(16, 8, 4, 0, 'DAT'),
(17, 9, 5, 1, 'DAT'),
(18, 9, 6, 0, 'DAT'),
(19, 10, 9, 1, 'DAT'),
(20, 10, 10, 0, 'DAT'),
(21, 11, 15, 1, 'DAT'),
(22, 11, 16, 0, 'DAT'),
(23, 12, 19, 1, NULL),
(24, 12, 20, 0, NULL),
(25, 13, 25, 1, 'DAT'),
(26, 13, 26, 0, 'DAT'),
(27, 14, 29, 1, 'DAT'),
(28, 14, 30, 0, 'DAT'),
(29, 15, 18, 1, NULL),
(30, 15, 22, 0, NULL),
(31, 16, 35, 1, 'DAT'),
(32, 16, 36, 0, 'DAT'),
(33, 17, 39, 1, 'DAT'),
(34, 17, 40, 0, 'DAT'),
(35, 18, 43, 1, 'DAT'),
(36, 18, 44, 0, 'DAT'),
(37, 19, 45, 1, 'DAT'),
(38, 19, 46, 0, 'DAT'),
(39, 20, 47, 1, 'DAT'),
(40, 20, 48, 0, 'DAT'),
(41, 21, 49, 1, 'DAT'),
(42, 21, 37, 0, 'DAT'),
(43, 22, 38, 1, 'DAT'),
(49, 101, 11, 1, NULL),
(50, 101, 12, 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `baocaotiendo`
--
ALTER TABLE `baocaotiendo`
  ADD PRIMARY KEY (`bao_cao_id`),
  ADD UNIQUE KEY `uq_bc_new` (`sinh_vien_id`,`dot_id`,`tuan_so`),
  ADD KEY `fk_bc_dot_new` (`dot_id`);

--
-- Indexes for table `congty`
--
ALTER TABLE `congty`
  ADD PRIMARY KEY (`cong_ty_id`);

--
-- Indexes for table `congtylinhvuc`
--
ALTER TABLE `congtylinhvuc`
  ADD PRIMARY KEY (`cong_ty_id`,`ten_linh_vuc`);

--
-- Indexes for table `dangkydetai`
--
ALTER TABLE `dangkydetai`
  ADD PRIMARY KEY (`dang_ky_dt_id`),
  ADD UNIQUE KEY `uq_dkdt_new` (`nhom_id`,`de_tai_id`),
  ADD KEY `fk_dkdt_dt` (`de_tai_id`);

--
-- Indexes for table `dangkythuctap`
--
ALTER TABLE `dangkythuctap`
  ADD PRIMARY KEY (`dang_ky_id`),
  ADD UNIQUE KEY `uq_new_dktt` (`sinh_vien_id`,`dot_id`),
  ADD KEY `fk_dktt_dot` (`dot_id`),
  ADD KEY `fk_dktt_ct` (`cong_ty_id`);

--
-- Indexes for table `detai`
--
ALTER TABLE `detai`
  ADD PRIMARY KEY (`de_tai_id`),
  ADD KEY `fk_dt_dot` (`dot_id`),
  ADD KEY `fk_dt_gv` (`giang_vien_id`);

--
-- Indexes for table `diembaocao`
--
ALTER TABLE `diembaocao`
  ADD PRIMARY KEY (`diem_bao_cao_id`),
  ADD UNIQUE KEY `uq_dbc_nhom_new` (`nhom_id`),
  ADD KEY `fk_dbc_gvhd` (`giang_vien_hd_id`),
  ADD KEY `fk_dbc_gvpb` (`giang_vien_pb_id`),
  ADD KEY `fk_dbc_sinhvien_new` (`sinh_vien_id`);

--
-- Indexes for table `diemhoidongbaove`
--
ALTER TABLE `diemhoidongbaove`
  ADD PRIMARY KEY (`diem_hd_id`),
  ADD UNIQUE KEY `uq_dhdbv_sv_nhom_gv_new` (`sinh_vien_id`,`nhom_id`,`giang_vien_id`),
  ADD KEY `fk_dhdbv_gv` (`giang_vien_id`),
  ADD KEY `fk_dhdbv_nhom_new` (`nhom_id`);

--
-- Indexes for table `diemthuctap`
--
ALTER TABLE `diemthuctap`
  ADD PRIMARY KEY (`diem_id`),
  ADD UNIQUE KEY `uq_dtt_new` (`sinh_vien_id`,`dot_id`),
  ADD KEY `fk_dtt_gv_new` (`giang_vien_id`),
  ADD KEY `fk_dtt_dot_new` (`dot_id`);

--
-- Indexes for table `diemtongketdatn`
--
ALTER TABLE `diemtongketdatn`
  ADD PRIMARY KEY (`tong_ket_id`),
  ADD UNIQUE KEY `uq_dtk_new` (`sinh_vien_id`),
  ADD KEY `fk_dtk_nhom_new` (`nhom_id`);

--
-- Indexes for table `dot`
--
ALTER TABLE `dot`
  ADD PRIMARY KEY (`dot_id`),
  ADD KEY `fk_dot_gv` (`giang_vien_id`);

--
-- Indexes for table `giangvien`
--
ALTER TABLE `giangvien`
  ADD PRIMARY KEY (`giang_vien_id`),
  ADD UNIQUE KEY `uq_gv_email` (`email`),
  ADD UNIQUE KEY `uq_gv_google_id` (`google_id`);

--
-- Indexes for table `hoidong`
--
ALTER TABLE `hoidong`
  ADD PRIMARY KEY (`hoi_dong_id`),
  ADD KEY `fk_hd_dot_new` (`dot_id`);

--
-- Indexes for table `lichbaove`
--
ALTER TABLE `lichbaove`
  ADD PRIMARY KEY (`lich_id`),
  ADD UNIQUE KEY `uq_lich_nhom` (`nhom_id`),
  ADD KEY `fk_lich_hd` (`hoi_dong_id`);

--
-- Indexes for table `loimoinhom`
--
ALTER TABLE `loimoinhom`
  ADD PRIMARY KEY (`loi_moi_id`),
  ADD UNIQUE KEY `uq_lmn_new` (`nhom_id`,`sinh_vien_duoc_moi_id`),
  ADD KEY `fk_lmn_sv` (`sinh_vien_duoc_moi_id`);

--
-- Indexes for table `lop`
--
ALTER TABLE `lop`
  ADD PRIMARY KEY (`lop_id`),
  ADD UNIQUE KEY `uq_ten_lop` (`ten_lop`);

--
-- Indexes for table `nhanxetbaocao`
--
ALTER TABLE `nhanxetbaocao`
  ADD PRIMARY KEY (`nhan_xet_id`),
  ADD UNIQUE KEY `uq_nx_baocao_new` (`bao_cao_id`),
  ADD KEY `fk_nx_gv` (`giang_vien_id`);

--
-- Indexes for table `nhomsvda`
--
ALTER TABLE `nhomsvda`
  ADD PRIMARY KEY (`nhom_id`),
  ADD KEY `fk_nhom_dt` (`de_tai_id`),
  ADD KEY `fk_nhom_dot_new` (`dot_id`),
  ADD KEY `fk_nhom_hd` (`hoi_dong_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `phanconghdtt`
--
ALTER TABLE `phanconghdtt`
  ADD PRIMARY KEY (`phan_cong_hd_id`),
  ADD UNIQUE KEY `uq_new_pchd` (`sinh_vien_id`,`dot_id`),
  ADD KEY `fk_pchd_gv` (`giang_vien_id`),
  ADD KEY `fk_pchd_dot` (`dot_id`);

--
-- Indexes for table `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD PRIMARY KEY (`sinh_vien_id`),
  ADD UNIQUE KEY `uq_sv_masv` (`ma_so_sinh_vien`),
  ADD UNIQUE KEY `uq_sv_email` (`email`),
  ADD UNIQUE KEY `uq_sv_google_id` (`google_id`),
  ADD KEY `fk_sv_lop` (`lop_id`);

--
-- Indexes for table `thanhvienhoidong`
--
ALTER TABLE `thanhvienhoidong`
  ADD PRIMARY KEY (`thanh_vien_hd_id`),
  ADD UNIQUE KEY `uq_tvhd_new` (`hoi_dong_id`,`giang_vien_id`),
  ADD KEY `fk_tvhd_gv` (`giang_vien_id`);

--
-- Indexes for table `thanhviennhom`
--
ALTER TABLE `thanhviennhom`
  ADD PRIMARY KEY (`thanh_vien_id`),
  ADD UNIQUE KEY `uq_tv_nhom_sv_new` (`nhom_id`,`sinh_vien_id`),
  ADD KEY `fk_tv_sv` (`sinh_vien_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `baocaotiendo`
--
ALTER TABLE `baocaotiendo`
  MODIFY `bao_cao_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `congty`
--
ALTER TABLE `congty`
  MODIFY `cong_ty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `dangkydetai`
--
ALTER TABLE `dangkydetai`
  MODIFY `dang_ky_dt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `dangkythuctap`
--
ALTER TABLE `dangkythuctap`
  MODIFY `dang_ky_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `detai`
--
ALTER TABLE `detai`
  MODIFY `de_tai_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `diembaocao`
--
ALTER TABLE `diembaocao`
  MODIFY `diem_bao_cao_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `diemhoidongbaove`
--
ALTER TABLE `diemhoidongbaove`
  MODIFY `diem_hd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `diemthuctap`
--
ALTER TABLE `diemthuctap`
  MODIFY `diem_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `diemtongketdatn`
--
ALTER TABLE `diemtongketdatn`
  MODIFY `tong_ket_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `dot`
--
ALTER TABLE `dot`
  MODIFY `dot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `giangvien`
--
ALTER TABLE `giangvien`
  MODIFY `giang_vien_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `hoidong`
--
ALTER TABLE `hoidong`
  MODIFY `hoi_dong_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lichbaove`
--
ALTER TABLE `lichbaove`
  MODIFY `lich_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `loimoinhom`
--
ALTER TABLE `loimoinhom`
  MODIFY `loi_moi_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `lop`
--
ALTER TABLE `lop`
  MODIFY `lop_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `nhanxetbaocao`
--
ALTER TABLE `nhanxetbaocao`
  MODIFY `nhan_xet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `nhomsvda`
--
ALTER TABLE `nhomsvda`
  MODIFY `nhom_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `phanconghdtt`
--
ALTER TABLE `phanconghdtt`
  MODIFY `phan_cong_hd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `sinhvien`
--
ALTER TABLE `sinhvien`
  MODIFY `sinh_vien_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `thanhvienhoidong`
--
ALTER TABLE `thanhvienhoidong`
  MODIFY `thanh_vien_hd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `thanhviennhom`
--
ALTER TABLE `thanhviennhom`
  MODIFY `thanh_vien_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `baocaotiendo`
--
ALTER TABLE `baocaotiendo`
  ADD CONSTRAINT `fk_bc_dot_new` FOREIGN KEY (`dot_id`) REFERENCES `dot` (`dot_id`),
  ADD CONSTRAINT `fk_bc_sv_new` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);

--
-- Constraints for table `congtylinhvuc`
--
ALTER TABLE `congtylinhvuc`
  ADD CONSTRAINT `fk_ctlv_ct` FOREIGN KEY (`cong_ty_id`) REFERENCES `congty` (`cong_ty_id`) ON DELETE CASCADE;

--
-- Constraints for table `dangkydetai`
--
ALTER TABLE `dangkydetai`
  ADD CONSTRAINT `fk_dkdt_dt` FOREIGN KEY (`de_tai_id`) REFERENCES `detai` (`de_tai_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dkdt_nhom_new` FOREIGN KEY (`nhom_id`) REFERENCES `nhomsvda` (`nhom_id`) ON DELETE CASCADE;

--
-- Constraints for table `dangkythuctap`
--
ALTER TABLE `dangkythuctap`
  ADD CONSTRAINT `fk_dktt_ct` FOREIGN KEY (`cong_ty_id`) REFERENCES `congty` (`cong_ty_id`),
  ADD CONSTRAINT `fk_dktt_dot` FOREIGN KEY (`dot_id`) REFERENCES `dot` (`dot_id`),
  ADD CONSTRAINT `fk_dktt_sv` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);

--
-- Constraints for table `detai`
--
ALTER TABLE `detai`
  ADD CONSTRAINT `fk_dt_dot` FOREIGN KEY (`dot_id`) REFERENCES `dot` (`dot_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dt_gv` FOREIGN KEY (`giang_vien_id`) REFERENCES `giangvien` (`giang_vien_id`) ON DELETE CASCADE;

--
-- Constraints for table `diembaocao`
--
ALTER TABLE `diembaocao`
  ADD CONSTRAINT `fk_dbc_gvhd` FOREIGN KEY (`giang_vien_hd_id`) REFERENCES `giangvien` (`giang_vien_id`),
  ADD CONSTRAINT `fk_dbc_gvpb` FOREIGN KEY (`giang_vien_pb_id`) REFERENCES `giangvien` (`giang_vien_id`),
  ADD CONSTRAINT `fk_dbc_nhom_new` FOREIGN KEY (`nhom_id`) REFERENCES `nhomsvda` (`nhom_id`),
  ADD CONSTRAINT `fk_dbc_sinhvien_new` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);

--
-- Constraints for table `diemhoidongbaove`
--
ALTER TABLE `diemhoidongbaove`
  ADD CONSTRAINT `fk_dhdbv_gv` FOREIGN KEY (`giang_vien_id`) REFERENCES `giangvien` (`giang_vien_id`),
  ADD CONSTRAINT `fk_dhdbv_nhom_new` FOREIGN KEY (`nhom_id`) REFERENCES `nhomsvda` (`nhom_id`),
  ADD CONSTRAINT `fk_dhdbv_sv` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);

--
-- Constraints for table `diemthuctap`
--
ALTER TABLE `diemthuctap`
  ADD CONSTRAINT `fk_dtt_dot_new` FOREIGN KEY (`dot_id`) REFERENCES `dot` (`dot_id`),
  ADD CONSTRAINT `fk_dtt_gv_new` FOREIGN KEY (`giang_vien_id`) REFERENCES `giangvien` (`giang_vien_id`),
  ADD CONSTRAINT `fk_dtt_sv_new` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);

--
-- Constraints for table `diemtongketdatn`
--
ALTER TABLE `diemtongketdatn`
  ADD CONSTRAINT `fk_dtk_nhom_new` FOREIGN KEY (`nhom_id`) REFERENCES `nhomsvda` (`nhom_id`),
  ADD CONSTRAINT `fk_dtk_sv_new` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);

--
-- Constraints for table `dot`
--
ALTER TABLE `dot`
  ADD CONSTRAINT `fk_dot_gv` FOREIGN KEY (`giang_vien_id`) REFERENCES `giangvien` (`giang_vien_id`);

--
-- Constraints for table `hoidong`
--
ALTER TABLE `hoidong`
  ADD CONSTRAINT `fk_hd_dot_new` FOREIGN KEY (`dot_id`) REFERENCES `dot` (`dot_id`) ON DELETE CASCADE;

--
-- Constraints for table `lichbaove`
--
ALTER TABLE `lichbaove`
  ADD CONSTRAINT `fk_lich_hd` FOREIGN KEY (`hoi_dong_id`) REFERENCES `hoidong` (`hoi_dong_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lich_nhom` FOREIGN KEY (`nhom_id`) REFERENCES `nhomsvda` (`nhom_id`) ON DELETE CASCADE;

--
-- Constraints for table `loimoinhom`
--
ALTER TABLE `loimoinhom`
  ADD CONSTRAINT `fk_lmn_nhom` FOREIGN KEY (`nhom_id`) REFERENCES `nhomsvda` (`nhom_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lmn_sv` FOREIGN KEY (`sinh_vien_duoc_moi_id`) REFERENCES `sinhvien` (`sinh_vien_id`) ON DELETE CASCADE;

--
-- Constraints for table `nhanxetbaocao`
--
ALTER TABLE `nhanxetbaocao`
  ADD CONSTRAINT `fk_nx_bc` FOREIGN KEY (`bao_cao_id`) REFERENCES `baocaotiendo` (`bao_cao_id`),
  ADD CONSTRAINT `fk_nx_gv` FOREIGN KEY (`giang_vien_id`) REFERENCES `giangvien` (`giang_vien_id`);

--
-- Constraints for table `nhomsvda`
--
ALTER TABLE `nhomsvda`
  ADD CONSTRAINT `fk_nhom_dot_new` FOREIGN KEY (`dot_id`) REFERENCES `dot` (`dot_id`),
  ADD CONSTRAINT `fk_nhom_dt` FOREIGN KEY (`de_tai_id`) REFERENCES `detai` (`de_tai_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_nhom_hd` FOREIGN KEY (`hoi_dong_id`) REFERENCES `hoidong` (`hoi_dong_id`) ON DELETE SET NULL;

--
-- Constraints for table `phanconghdtt`
--
ALTER TABLE `phanconghdtt`
  ADD CONSTRAINT `fk_pchd_dot` FOREIGN KEY (`dot_id`) REFERENCES `dot` (`dot_id`),
  ADD CONSTRAINT `fk_pchd_gv` FOREIGN KEY (`giang_vien_id`) REFERENCES `giangvien` (`giang_vien_id`),
  ADD CONSTRAINT `fk_pchd_sv` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);

--
-- Constraints for table `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD CONSTRAINT `fk_sv_lop` FOREIGN KEY (`lop_id`) REFERENCES `lop` (`lop_id`);

--
-- Constraints for table `thanhvienhoidong`
--
ALTER TABLE `thanhvienhoidong`
  ADD CONSTRAINT `fk_tvhd_gv` FOREIGN KEY (`giang_vien_id`) REFERENCES `giangvien` (`giang_vien_id`),
  ADD CONSTRAINT `fk_tvhd_hd` FOREIGN KEY (`hoi_dong_id`) REFERENCES `hoidong` (`hoi_dong_id`) ON DELETE CASCADE;

--
-- Constraints for table `thanhviennhom`
--
ALTER TABLE `thanhviennhom`
  ADD CONSTRAINT `fk_tv_nhom_new` FOREIGN KEY (`nhom_id`) REFERENCES `nhomsvda` (`nhom_id`),
  ADD CONSTRAINT `fk_tv_sv` FOREIGN KEY (`sinh_vien_id`) REFERENCES `sinhvien` (`sinh_vien_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

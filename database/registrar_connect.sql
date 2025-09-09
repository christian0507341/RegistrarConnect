--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-09-09 10:16:08

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 16664)
-- Name: accounts_user; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.accounts_user (
    id bigint NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL,
    email character varying(254) NOT NULL,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    last_name character varying(50) NOT NULL,
    student_id character varying(20),
    role character varying(20) NOT NULL,
    username character varying(150) NOT NULL
);


ALTER TABLE public.accounts_user OWNER TO registrar_user;

--
-- TOC entry 230 (class 1259 OID 16677)
-- Name: accounts_user_groups; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.accounts_user_groups (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.accounts_user_groups OWNER TO registrar_user;

--
-- TOC entry 229 (class 1259 OID 16676)
-- Name: accounts_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.accounts_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_user_groups_id_seq OWNER TO registrar_user;

--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 229
-- Name: accounts_user_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.accounts_user_groups_id_seq OWNED BY public.accounts_user_groups.id;


--
-- TOC entry 227 (class 1259 OID 16663)
-- Name: accounts_user_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.accounts_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_user_id_seq OWNER TO registrar_user;

--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 227
-- Name: accounts_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.accounts_user_id_seq OWNED BY public.accounts_user.id;


--
-- TOC entry 232 (class 1259 OID 16684)
-- Name: accounts_user_user_permissions; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.accounts_user_user_permissions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.accounts_user_user_permissions OWNER TO registrar_user;

--
-- TOC entry 231 (class 1259 OID 16683)
-- Name: accounts_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.accounts_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_user_user_permissions_id_seq OWNER TO registrar_user;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 231
-- Name: accounts_user_user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.accounts_user_user_permissions_id_seq OWNED BY public.accounts_user_user_permissions.id;


--
-- TOC entry 236 (class 1259 OID 16743)
-- Name: appointments_appointment; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.appointments_appointment (
    id bigint NOT NULL,
    purpose text NOT NULL,
    schedule timestamp with time zone,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    faculty_id bigint,
    student_id bigint NOT NULL
);


ALTER TABLE public.appointments_appointment OWNER TO registrar_user;

--
-- TOC entry 235 (class 1259 OID 16742)
-- Name: appointments_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.appointments_appointment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointment_id_seq OWNER TO registrar_user;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 235
-- Name: appointments_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments_appointment.id;


--
-- TOC entry 241 (class 1259 OID 16830)
-- Name: appointments_appointmentaction; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.appointments_appointmentaction (
    id bigint NOT NULL,
    action character varying(32) NOT NULL,
    from_status character varying(20),
    to_status character varying(20),
    notes text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    actor_id bigint,
    appointment_id bigint NOT NULL
);


ALTER TABLE public.appointments_appointmentaction OWNER TO registrar_user;

--
-- TOC entry 240 (class 1259 OID 16829)
-- Name: appointments_appointmentaction_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.appointments_appointmentaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointmentaction_id_seq OWNER TO registrar_user;

--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 240
-- Name: appointments_appointmentaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.appointments_appointmentaction_id_seq OWNED BY public.appointments_appointmentaction.id;


--
-- TOC entry 224 (class 1259 OID 16622)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO registrar_user;

--
-- TOC entry 223 (class 1259 OID 16621)
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.auth_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_group_id_seq OWNER TO registrar_user;

--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 223
-- Name: auth_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.auth_group_id_seq OWNED BY public.auth_group.id;


--
-- TOC entry 226 (class 1259 OID 16631)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO registrar_user;

--
-- TOC entry 225 (class 1259 OID 16630)
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_group_permissions_id_seq OWNER TO registrar_user;

--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 225
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.auth_group_permissions_id_seq OWNED BY public.auth_group_permissions.id;


--
-- TOC entry 222 (class 1259 OID 16615)
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO registrar_user;

--
-- TOC entry 221 (class 1259 OID 16614)
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.auth_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_permission_id_seq OWNER TO registrar_user;

--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 221
-- Name: auth_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.auth_permission_id_seq OWNED BY public.auth_permission.id;


--
-- TOC entry 234 (class 1259 OID 16721)
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id bigint NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO registrar_user;

--
-- TOC entry 233 (class 1259 OID 16720)
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.django_admin_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.django_admin_log_id_seq OWNER TO registrar_user;

--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 233
-- Name: django_admin_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.django_admin_log_id_seq OWNED BY public.django_admin_log.id;


--
-- TOC entry 220 (class 1259 OID 16591)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO registrar_user;

--
-- TOC entry 219 (class 1259 OID 16590)
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.django_content_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.django_content_type_id_seq OWNER TO registrar_user;

--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 219
-- Name: django_content_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.django_content_type_id_seq OWNED BY public.django_content_type.id;


--
-- TOC entry 218 (class 1259 OID 16582)
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO registrar_user;

--
-- TOC entry 217 (class 1259 OID 16581)
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.django_migrations_id_seq OWNER TO registrar_user;

--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 217
-- Name: django_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.django_migrations_id_seq OWNED BY public.django_migrations.id;


--
-- TOC entry 239 (class 1259 OID 16784)
-- Name: django_session; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO registrar_user;

--
-- TOC entry 238 (class 1259 OID 16764)
-- Name: document_requests_documentrequest; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.document_requests_documentrequest (
    id bigint NOT NULL,
    document_type character varying(50) NOT NULL,
    purpose text NOT NULL,
    status character varying(20) NOT NULL,
    requested_at timestamp with time zone NOT NULL,
    processed_by_id bigint,
    student_id bigint NOT NULL
);


ALTER TABLE public.document_requests_documentrequest OWNER TO registrar_user;

--
-- TOC entry 237 (class 1259 OID 16763)
-- Name: document_requests_documentrequest_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.document_requests_documentrequest_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_requests_documentrequest_id_seq OWNER TO registrar_user;

--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 237
-- Name: document_requests_documentrequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.document_requests_documentrequest_id_seq OWNED BY public.document_requests_documentrequest.id;


--
-- TOC entry 243 (class 1259 OID 16851)
-- Name: document_requests_documentrequestaction; Type: TABLE; Schema: public; Owner: registrar_user
--

CREATE TABLE public.document_requests_documentrequestaction (
    id bigint NOT NULL,
    action character varying(32) NOT NULL,
    from_status character varying(20),
    to_status character varying(20),
    notes text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    actor_id bigint,
    request_id bigint NOT NULL
);


ALTER TABLE public.document_requests_documentrequestaction OWNER TO registrar_user;

--
-- TOC entry 242 (class 1259 OID 16850)
-- Name: document_requests_documentrequestaction_id_seq; Type: SEQUENCE; Schema: public; Owner: registrar_user
--

CREATE SEQUENCE public.document_requests_documentrequestaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_requests_documentrequestaction_id_seq OWNER TO registrar_user;

--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 242
-- Name: document_requests_documentrequestaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: registrar_user
--

ALTER SEQUENCE public.document_requests_documentrequestaction_id_seq OWNED BY public.document_requests_documentrequestaction.id;


--
-- TOC entry 4710 (class 2604 OID 16667)
-- Name: accounts_user id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user ALTER COLUMN id SET DEFAULT nextval('public.accounts_user_id_seq'::regclass);


--
-- TOC entry 4711 (class 2604 OID 16680)
-- Name: accounts_user_groups id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_groups ALTER COLUMN id SET DEFAULT nextval('public.accounts_user_groups_id_seq'::regclass);


--
-- TOC entry 4712 (class 2604 OID 16687)
-- Name: accounts_user_user_permissions id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_user_permissions ALTER COLUMN id SET DEFAULT nextval('public.accounts_user_user_permissions_id_seq'::regclass);


--
-- TOC entry 4714 (class 2604 OID 16746)
-- Name: appointments_appointment id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointment ALTER COLUMN id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);


--
-- TOC entry 4716 (class 2604 OID 16833)
-- Name: appointments_appointmentaction id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointmentaction ALTER COLUMN id SET DEFAULT nextval('public.appointments_appointmentaction_id_seq'::regclass);


--
-- TOC entry 4708 (class 2604 OID 16625)
-- Name: auth_group id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group ALTER COLUMN id SET DEFAULT nextval('public.auth_group_id_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 16634)
-- Name: auth_group_permissions id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group_permissions ALTER COLUMN id SET DEFAULT nextval('public.auth_group_permissions_id_seq'::regclass);


--
-- TOC entry 4707 (class 2604 OID 16618)
-- Name: auth_permission id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_permission ALTER COLUMN id SET DEFAULT nextval('public.auth_permission_id_seq'::regclass);


--
-- TOC entry 4713 (class 2604 OID 16724)
-- Name: django_admin_log id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_admin_log ALTER COLUMN id SET DEFAULT nextval('public.django_admin_log_id_seq'::regclass);


--
-- TOC entry 4706 (class 2604 OID 16594)
-- Name: django_content_type id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_content_type ALTER COLUMN id SET DEFAULT nextval('public.django_content_type_id_seq'::regclass);


--
-- TOC entry 4705 (class 2604 OID 16585)
-- Name: django_migrations id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_migrations ALTER COLUMN id SET DEFAULT nextval('public.django_migrations_id_seq'::regclass);


--
-- TOC entry 4715 (class 2604 OID 16767)
-- Name: document_requests_documentrequest id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequest ALTER COLUMN id SET DEFAULT nextval('public.document_requests_documentrequest_id_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 16854)
-- Name: document_requests_documentrequestaction id; Type: DEFAULT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequestaction ALTER COLUMN id SET DEFAULT nextval('public.document_requests_documentrequestaction_id_seq'::regclass);


--
-- TOC entry 4961 (class 0 OID 16664)
-- Dependencies: 228
-- Data for Name: accounts_user; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.accounts_user (id, password, last_login, is_superuser, is_staff, is_active, date_joined, email, first_name, middle_name, last_name, student_id, role, username) FROM stdin;
11	pbkdf2_sha256$260000$Md7FBiNmglzlLwmOsLlWoP$egvn1D1kPyvPhJgcFmCrVUljhNLGvsYwpigUFSSadTA=	2025-08-24 11:19:09.317055-07	t	t	t	2025-08-24 11:18:17.417639-07	testing.up@phinmaed.com		\N		\N	student	testing
12	pbkdf2_sha256$260000$yAftVCT3ckfX0cH1TKmnmN$kPtIdBOBhxWotwjGMD9tI3fyrg8mHMo+Fm1g32y4cwQ=	\N	f	f	t	2025-08-24 11:31:37.051132-07	student.one.up@phinmaed.com	Student	Test	User	03-2324-092300	student	student.one.up
13	pbkdf2_sha256$260000$b2T3KDNS5ylC3jkCuNMe7t$iRKiloqOVp0VTcnYFPkv4YkZPLtF+Tnw7m+8pvCaifo=	\N	f	f	t	2025-08-24 11:31:49.698692-07	faculty.one.up@phinmaed.com	Faculty		Member		faculty	faculty.one.up
\.


--
-- TOC entry 4963 (class 0 OID 16677)
-- Dependencies: 230
-- Data for Name: accounts_user_groups; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.accounts_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- TOC entry 4965 (class 0 OID 16684)
-- Dependencies: 232
-- Data for Name: accounts_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.accounts_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- TOC entry 4969 (class 0 OID 16743)
-- Dependencies: 236
-- Data for Name: appointments_appointment; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.appointments_appointment (id, purpose, schedule, status, created_at, faculty_id, student_id) FROM stdin;
\.


--
-- TOC entry 4974 (class 0 OID 16830)
-- Dependencies: 241
-- Data for Name: appointments_appointmentaction; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.appointments_appointmentaction (id, action, from_status, to_status, notes, created_at, actor_id, appointment_id) FROM stdin;
\.


--
-- TOC entry 4957 (class 0 OID 16622)
-- Dependencies: 224
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- TOC entry 4959 (class 0 OID 16631)
-- Dependencies: 226
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- TOC entry 4955 (class 0 OID 16615)
-- Dependencies: 222
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	2	add_permission
6	Can change permission	2	change_permission
7	Can delete permission	2	delete_permission
8	Can view permission	2	view_permission
9	Can add group	3	add_group
10	Can change group	3	change_group
11	Can delete group	3	delete_group
12	Can view group	3	view_group
13	Can add content type	4	add_contenttype
14	Can change content type	4	change_contenttype
15	Can delete content type	4	delete_contenttype
16	Can view content type	4	view_contenttype
17	Can add session	5	add_session
18	Can change session	5	change_session
19	Can delete session	5	delete_session
20	Can view session	5	view_session
21	Can add user	6	add_user
22	Can change user	6	change_user
23	Can delete user	6	delete_user
24	Can view user	6	view_user
25	Can add document request	7	add_documentrequest
26	Can change document request	7	change_documentrequest
27	Can delete document request	7	delete_documentrequest
28	Can view document request	7	view_documentrequest
29	Can add appointment	8	add_appointment
30	Can change appointment	8	change_appointment
31	Can delete appointment	8	delete_appointment
32	Can view appointment	8	view_appointment
33	Can add document request action	9	add_documentrequestaction
34	Can change document request action	9	change_documentrequestaction
35	Can delete document request action	9	delete_documentrequestaction
36	Can view document request action	9	view_documentrequestaction
37	Can add appointment action	10	add_appointmentaction
38	Can change appointment action	10	change_appointmentaction
39	Can delete appointment action	10	delete_appointmentaction
40	Can view appointment action	10	view_appointmentaction
\.


--
-- TOC entry 4967 (class 0 OID 16721)
-- Dependencies: 234
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
11	2025-08-24 11:19:26.51586-07	10	faculty.one.up	3		6	11
\.


--
-- TOC entry 4953 (class 0 OID 16591)
-- Dependencies: 220
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	contenttypes	contenttype
5	sessions	session
6	accounts	user
7	document_requests	documentrequest
8	appointments	appointment
9	document_requests	documentrequestaction
10	appointments	appointmentaction
\.


--
-- TOC entry 4951 (class 0 OID 16582)
-- Dependencies: 218
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2025-08-19 11:27:44.552119-07
2	contenttypes	0002_remove_content_type_name	2025-08-19 11:34:14.427061-07
3	auth	0001_initial	2025-08-19 11:34:14.518972-07
4	auth	0002_alter_permission_name_max_length	2025-08-19 11:34:14.529965-07
5	auth	0003_alter_user_email_max_length	2025-08-19 11:34:14.539957-07
6	auth	0004_alter_user_username_opts	2025-08-19 11:34:14.554949-07
7	auth	0005_alter_user_last_login_null	2025-08-19 11:34:14.566943-07
8	auth	0006_require_contenttypes_0002	2025-08-19 11:34:14.570622-07
9	auth	0007_alter_validators_add_error_messages	2025-08-19 11:34:14.582615-07
10	auth	0008_alter_user_username_max_length	2025-08-19 11:34:14.593608-07
11	auth	0009_alter_user_last_name_max_length	2025-08-19 11:34:14.604601-07
12	auth	0010_alter_group_name_max_length	2025-08-19 11:34:14.615703-07
13	auth	0011_update_proxy_permissions	2025-08-19 11:34:14.624406-07
14	auth	0012_alter_user_first_name_max_length	2025-08-19 11:34:14.634397-07
15	accounts	0001_initial	2025-08-19 11:34:14.715022-07
16	admin	0001_initial	2025-08-19 11:34:14.756718-07
17	admin	0002_logentry_remove_auto_add	2025-08-19 11:34:14.77571-07
18	admin	0003_logentry_add_action_flag_choices	2025-08-19 11:34:14.788704-07
19	appointments	0001_initial	2025-08-19 11:34:14.831678-07
20	document_requests	0001_initial	2025-08-19 11:34:14.869029-07
21	sessions	0001_initial	2025-08-19 11:34:14.893016-07
22	accounts	0002_auto_20250820_1054	2025-08-20 10:55:06.522088-07
23	appointments	0002_appointmentaction	2025-08-20 10:55:06.588701-07
24	document_requests	0002_documentrequestaction	2025-08-20 10:55:06.639482-07
25	accounts	0003_auto_20250822_1456	2025-08-22 14:56:20.018649-07
26	accounts	0004_auto_20250823_1157	2025-08-23 12:10:06.621995-07
\.


--
-- TOC entry 4972 (class 0 OID 16784)
-- Dependencies: 239
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
tmgsvf4wdluo1zlesfm7xtt8m1akaqhl	.eJxVjEEOwiAQAP_C2RAXKi4evfsGsrCLVA0kpT0Z_25IetDrzGTeKtC2lrB1WcLM6qIA1OEXRkpPqcPwg-q96dTqusxRj0TvtutbY3ld9_ZvUKiX8bUp58Se2YNLZHGKJnoH_pxZKLqjFUGEiGhgAkS0Hk5sQAQsWXbq8wUdxDgP:1uqFJ7:TaQxbKJkCEDxwoMzlwpHUKVD3FjyHhCt3jmcwYInwG8	2025-09-07 11:19:09.328302-07
\.


--
-- TOC entry 4971 (class 0 OID 16764)
-- Dependencies: 238
-- Data for Name: document_requests_documentrequest; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.document_requests_documentrequest (id, document_type, purpose, status, requested_at, processed_by_id, student_id) FROM stdin;
\.


--
-- TOC entry 4976 (class 0 OID 16851)
-- Dependencies: 243
-- Data for Name: document_requests_documentrequestaction; Type: TABLE DATA; Schema: public; Owner: registrar_user
--

COPY public.document_requests_documentrequestaction (id, action, from_status, to_status, notes, created_at, actor_id, request_id) FROM stdin;
\.


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 229
-- Name: accounts_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.accounts_user_groups_id_seq', 1, false);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 227
-- Name: accounts_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.accounts_user_id_seq', 13, true);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 231
-- Name: accounts_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.accounts_user_user_permissions_id_seq', 1, false);


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 235
-- Name: appointments_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.appointments_appointment_id_seq', 1, true);


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 240
-- Name: appointments_appointmentaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.appointments_appointmentaction_id_seq', 1, true);


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 223
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 225
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 221
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 40, true);


--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 233
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 11, true);


--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 219
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 10, true);


--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 217
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 26, true);


--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 237
-- Name: document_requests_documentrequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.document_requests_documentrequest_id_seq', 1, true);


--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 242
-- Name: document_requests_documentrequestaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: registrar_user
--

SELECT pg_catalog.setval('public.document_requests_documentrequestaction_id_seq', 1, true);


--
-- TOC entry 4743 (class 2606 OID 16673)
-- Name: accounts_user accounts_user_email_key; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user
    ADD CONSTRAINT accounts_user_email_key UNIQUE (email);


--
-- TOC entry 4754 (class 2606 OID 16682)
-- Name: accounts_user_groups accounts_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_groups
    ADD CONSTRAINT accounts_user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 16693)
-- Name: accounts_user_groups accounts_user_groups_user_id_group_id_59c0b32f_uniq; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_groups
    ADD CONSTRAINT accounts_user_groups_user_id_group_id_59c0b32f_uniq UNIQUE (user_id, group_id);


--
-- TOC entry 4745 (class 2606 OID 16671)
-- Name: accounts_user accounts_user_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user
    ADD CONSTRAINT accounts_user_pkey PRIMARY KEY (id);


--
-- TOC entry 4748 (class 2606 OID 16675)
-- Name: accounts_user accounts_user_student_id_key; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user
    ADD CONSTRAINT accounts_user_student_id_key UNIQUE (student_id);


--
-- TOC entry 4759 (class 2606 OID 16707)
-- Name: accounts_user_user_permissions accounts_user_user_permi_user_id_permission_id_2ab516c2_uniq; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_user_permissions
    ADD CONSTRAINT accounts_user_user_permi_user_id_permission_id_2ab516c2_uniq UNIQUE (user_id, permission_id);


--
-- TOC entry 4762 (class 2606 OID 16689)
-- Name: accounts_user_user_permissions accounts_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_user_permissions
    ADD CONSTRAINT accounts_user_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4751 (class 2606 OID 24776)
-- Name: accounts_user accounts_user_username_key; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user
    ADD CONSTRAINT accounts_user_username_key UNIQUE (username);


--
-- TOC entry 4770 (class 2606 OID 16750)
-- Name: appointments_appointment appointments_appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointment
    ADD CONSTRAINT appointments_appointment_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 16837)
-- Name: appointments_appointmentaction appointments_appointmentaction_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointmentaction
    ADD CONSTRAINT appointments_appointmentaction_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 16661)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- TOC entry 4737 (class 2606 OID 16647)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- TOC entry 4740 (class 2606 OID 16636)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4734 (class 2606 OID 16627)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- TOC entry 4727 (class 2606 OID 16638)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- TOC entry 4729 (class 2606 OID 16620)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- TOC entry 4766 (class 2606 OID 16729)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4722 (class 2606 OID 16598)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- TOC entry 4724 (class 2606 OID 16596)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 16589)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4778 (class 2606 OID 16790)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- TOC entry 4773 (class 2606 OID 16771)
-- Name: document_requests_documentrequest document_requests_documentrequest_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequest
    ADD CONSTRAINT document_requests_documentrequest_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 16858)
-- Name: document_requests_documentrequestaction document_requests_documentrequestaction_pkey; Type: CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequestaction
    ADD CONSTRAINT document_requests_documentrequestaction_pkey PRIMARY KEY (id);


--
-- TOC entry 4741 (class 1259 OID 16690)
-- Name: accounts_user_email_b2644a56_like; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX accounts_user_email_b2644a56_like ON public.accounts_user USING btree (email varchar_pattern_ops);


--
-- TOC entry 4752 (class 1259 OID 16705)
-- Name: accounts_user_groups_group_id_bd11a704; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX accounts_user_groups_group_id_bd11a704 ON public.accounts_user_groups USING btree (group_id);


--
-- TOC entry 4755 (class 1259 OID 16704)
-- Name: accounts_user_groups_user_id_52b62117; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX accounts_user_groups_user_id_52b62117 ON public.accounts_user_groups USING btree (user_id);


--
-- TOC entry 4746 (class 1259 OID 16691)
-- Name: accounts_user_student_id_9ac5f3fa_like; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX accounts_user_student_id_9ac5f3fa_like ON public.accounts_user USING btree (student_id varchar_pattern_ops);


--
-- TOC entry 4760 (class 1259 OID 16719)
-- Name: accounts_user_user_permissions_permission_id_113bb443; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX accounts_user_user_permissions_permission_id_113bb443 ON public.accounts_user_user_permissions USING btree (permission_id);


--
-- TOC entry 4763 (class 1259 OID 16718)
-- Name: accounts_user_user_permissions_user_id_e4f0a161; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX accounts_user_user_permissions_user_id_e4f0a161 ON public.accounts_user_user_permissions USING btree (user_id);


--
-- TOC entry 4749 (class 1259 OID 24777)
-- Name: accounts_user_username_6088629e_like; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX accounts_user_username_6088629e_like ON public.accounts_user USING btree (username varchar_pattern_ops);


--
-- TOC entry 4768 (class 1259 OID 16761)
-- Name: appointments_appointment_faculty_id_4e512143; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX appointments_appointment_faculty_id_4e512143 ON public.appointments_appointment USING btree (faculty_id);


--
-- TOC entry 4771 (class 1259 OID 16762)
-- Name: appointments_appointment_student_id_09946526; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX appointments_appointment_student_id_09946526 ON public.appointments_appointment USING btree (student_id);


--
-- TOC entry 4780 (class 1259 OID 16848)
-- Name: appointments_appointmentaction_actor_id_0d27bde5; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX appointments_appointmentaction_actor_id_0d27bde5 ON public.appointments_appointmentaction USING btree (actor_id);


--
-- TOC entry 4781 (class 1259 OID 16849)
-- Name: appointments_appointmentaction_appointment_id_fb92b932; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX appointments_appointmentaction_appointment_id_fb92b932 ON public.appointments_appointmentaction USING btree (appointment_id);


--
-- TOC entry 4730 (class 1259 OID 16662)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- TOC entry 4735 (class 1259 OID 16658)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- TOC entry 4738 (class 1259 OID 16659)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- TOC entry 4725 (class 1259 OID 16644)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- TOC entry 4764 (class 1259 OID 16740)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- TOC entry 4767 (class 1259 OID 16741)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- TOC entry 4776 (class 1259 OID 16792)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- TOC entry 4779 (class 1259 OID 16791)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- TOC entry 4774 (class 1259 OID 16782)
-- Name: document_requests_documentrequest_processed_by_id_d3ddede0; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX document_requests_documentrequest_processed_by_id_d3ddede0 ON public.document_requests_documentrequest USING btree (processed_by_id);


--
-- TOC entry 4775 (class 1259 OID 16783)
-- Name: document_requests_documentrequest_student_id_239a87ef; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX document_requests_documentrequest_student_id_239a87ef ON public.document_requests_documentrequest USING btree (student_id);


--
-- TOC entry 4784 (class 1259 OID 16869)
-- Name: document_requests_documentrequestaction_actor_id_9c6a83ee; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX document_requests_documentrequestaction_actor_id_9c6a83ee ON public.document_requests_documentrequestaction USING btree (actor_id);


--
-- TOC entry 4787 (class 1259 OID 16870)
-- Name: document_requests_documentrequestaction_request_id_54b48487; Type: INDEX; Schema: public; Owner: registrar_user
--

CREATE INDEX document_requests_documentrequestaction_request_id_54b48487 ON public.document_requests_documentrequestaction USING btree (request_id);


--
-- TOC entry 4791 (class 2606 OID 16699)
-- Name: accounts_user_groups accounts_user_groups_group_id_bd11a704_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_groups
    ADD CONSTRAINT accounts_user_groups_group_id_bd11a704_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4792 (class 2606 OID 16694)
-- Name: accounts_user_groups accounts_user_groups_user_id_52b62117_fk_accounts_user_id; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_groups
    ADD CONSTRAINT accounts_user_groups_user_id_52b62117_fk_accounts_user_id FOREIGN KEY (user_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4793 (class 2606 OID 16713)
-- Name: accounts_user_user_permissions accounts_user_user_p_permission_id_113bb443_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_user_permissions
    ADD CONSTRAINT accounts_user_user_p_permission_id_113bb443_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4794 (class 2606 OID 16708)
-- Name: accounts_user_user_permissions accounts_user_user_p_user_id_e4f0a161_fk_accounts_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.accounts_user_user_permissions
    ADD CONSTRAINT accounts_user_user_p_user_id_e4f0a161_fk_accounts_ FOREIGN KEY (user_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4801 (class 2606 OID 16838)
-- Name: appointments_appointmentaction appointments_appoint_actor_id_0d27bde5_fk_accounts_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointmentaction
    ADD CONSTRAINT appointments_appoint_actor_id_0d27bde5_fk_accounts_ FOREIGN KEY (actor_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4802 (class 2606 OID 16843)
-- Name: appointments_appointmentaction appointments_appoint_appointment_id_fb92b932_fk_appointme; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointmentaction
    ADD CONSTRAINT appointments_appoint_appointment_id_fb92b932_fk_appointme FOREIGN KEY (appointment_id) REFERENCES public.appointments_appointment(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4797 (class 2606 OID 16751)
-- Name: appointments_appointment appointments_appoint_faculty_id_4e512143_fk_accounts_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointment
    ADD CONSTRAINT appointments_appoint_faculty_id_4e512143_fk_accounts_ FOREIGN KEY (faculty_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4798 (class 2606 OID 16756)
-- Name: appointments_appointment appointments_appoint_student_id_09946526_fk_accounts_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.appointments_appointment
    ADD CONSTRAINT appointments_appoint_student_id_09946526_fk_accounts_ FOREIGN KEY (student_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4789 (class 2606 OID 16653)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4790 (class 2606 OID 16648)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4788 (class 2606 OID 16639)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4795 (class 2606 OID 16730)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4796 (class 2606 OID 16735)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_accounts_user_id; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_accounts_user_id FOREIGN KEY (user_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4803 (class 2606 OID 16859)
-- Name: document_requests_documentrequestaction document_requests_do_actor_id_9c6a83ee_fk_accounts_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequestaction
    ADD CONSTRAINT document_requests_do_actor_id_9c6a83ee_fk_accounts_ FOREIGN KEY (actor_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4799 (class 2606 OID 16772)
-- Name: document_requests_documentrequest document_requests_do_processed_by_id_d3ddede0_fk_accounts_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequest
    ADD CONSTRAINT document_requests_do_processed_by_id_d3ddede0_fk_accounts_ FOREIGN KEY (processed_by_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4804 (class 2606 OID 16864)
-- Name: document_requests_documentrequestaction document_requests_do_request_id_54b48487_fk_document_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequestaction
    ADD CONSTRAINT document_requests_do_request_id_54b48487_fk_document_ FOREIGN KEY (request_id) REFERENCES public.document_requests_documentrequest(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4800 (class 2606 OID 16777)
-- Name: document_requests_documentrequest document_requests_do_student_id_239a87ef_fk_accounts_; Type: FK CONSTRAINT; Schema: public; Owner: registrar_user
--

ALTER TABLE ONLY public.document_requests_documentrequest
    ADD CONSTRAINT document_requests_do_student_id_239a87ef_fk_accounts_ FOREIGN KEY (student_id) REFERENCES public.accounts_user(id) DEFERRABLE INITIALLY DEFERRED;


-- Completed on 2025-09-09 10:16:08

--
-- PostgreSQL database dump complete
--


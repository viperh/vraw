import type {
  DiagramEdge,
  DiagramKind,
  DiagramNode,
  EdgeData,
  ShapeKind,
} from "@/types/diagram";
import { createNode, makeId } from "@/lib/shape-catalog";
import { DEFAULT_EDGE_DATA } from "@/stores/editor-store";

export interface TemplateGraph {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface Template {
  id: string;
  name: string;
  group: string;
  kind: DiagramKind;
  build: () => TemplateGraph;
}

function edge(
  source: string,
  target: string,
  data: Partial<EdgeData> = {},
): DiagramEdge {
  return {
    id: makeId("e"),
    source,
    target,
    type: "smart",
    data: { ...DEFAULT_EDGE_DATA, ...data },
  };
}

function n(
  kind: ShapeKind,
  x: number,
  y: number,
  label: string,
  size?: [number, number],
  data: Record<string, unknown> = {},
): DiagramNode {
  return createNode(kind, { x, y }, size, { label, ...data });
}

export const TEMPLATES: Template[] = [
  {
    id: "tpl-login",
    name: "Login Process",
    group: "Flowcharts",
    kind: "flowchart",
    build() {
      const a = n("terminator", 360, 0, "Start", [140, 56]);
      const b = n("input-output", 350, 110, "Enter credentials", [160, 64]);
      const c = n("decision", 365, 220, "Valid?", [130, 100]);
      const d = n("process", 360, 360, "Create session", [150, 64]);
      const e = n("process", 150, 230, "Show error", [140, 64]);
      const f = n("terminator", 365, 470, "Dashboard", [140, 56]);
      return {
        nodes: [a, b, c, d, e, f],
        edges: [
          edge(a.id, b.id),
          edge(b.id, c.id),
          edge(c.id, d.id, { label: "Yes" }),
          edge(c.id, e.id, { label: "No" }),
          edge(e.id, b.id, { routing: "smoothstep" }),
          edge(d.id, f.id),
        ],
      };
    },
  },
  {
    id: "tpl-order",
    name: "Order Workflow",
    group: "Flowcharts",
    kind: "flowchart",
    build() {
      const a = n("terminator", 60, 40, "Order placed", [150, 56]);
      const b = n("decision", 70, 150, "In stock?", [130, 100]);
      const c = n("process", 280, 60, "Reserve items", [150, 64]);
      const d = n("process", 280, 250, "Backorder", [150, 64]);
      const e = n("process", 500, 60, "Charge payment", [150, 64]);
      const f = n("document", 500, 250, "Generate invoice", [160, 90]);
      const g = n("terminator", 720, 70, "Ship order", [140, 56]);
      return {
        nodes: [a, b, c, d, e, f, g],
        edges: [
          edge(a.id, b.id),
          edge(b.id, c.id, { label: "Yes" }),
          edge(b.id, d.id, { label: "No" }),
          edge(c.id, e.id),
          edge(d.id, f.id),
          edge(e.id, f.id),
          edge(e.id, g.id),
        ],
      };
    },
  },
  {
    id: "tpl-approval",
    name: "Approval Workflow",
    group: "Flowcharts",
    kind: "flowchart",
    build() {
      const a = n("terminator", 340, 0, "Request", [140, 56]);
      const b = n("process", 335, 100, "Manager review", [160, 64]);
      const c = n("decision", 360, 210, "Approved?", [130, 100]);
      const d = n("process", 360, 350, "Process request", [150, 64]);
      const e = n("process", 120, 220, "Notify rejection", [160, 64]);
      const f = n("terminator", 365, 460, "Done", [130, 56]);
      return {
        nodes: [a, b, c, d, e, f],
        edges: [
          edge(a.id, b.id),
          edge(b.id, c.id),
          edge(c.id, d.id, { label: "Yes" }),
          edge(c.id, e.id, { label: "No" }),
          edge(d.id, f.id),
          edge(e.id, f.id),
        ],
      };
    },
  },
  {
    id: "tpl-user-mgmt",
    name: "User Management System",
    group: "UML",
    kind: "uml-class",
    build() {
      const user = n("uml-class", 60, 40, "User", [200, 150], {
        attributes: [
          { id: makeId("a"), name: "id: int", visibility: "private" },
          { id: makeId("a"), name: "email: string", visibility: "private" },
          { id: makeId("a"), name: "password: string", visibility: "private" },
        ],
        methods: [
          { id: makeId("m"), name: "login(): bool", visibility: "public" },
          { id: makeId("m"), name: "logout(): void", visibility: "public" },
        ],
      });
      const role = n("uml-class", 380, 40, "Role", [190, 110], {
        attributes: [
          { id: makeId("a"), name: "id: int", visibility: "private" },
          { id: makeId("a"), name: "name: string", visibility: "private" },
        ],
        methods: [{ id: makeId("m"), name: "permissions(): []", visibility: "public" }],
      });
      const profile = n("uml-class", 60, 280, "Profile", [200, 120], {
        attributes: [
          { id: makeId("a"), name: "avatar: string", visibility: "private" },
          { id: makeId("a"), name: "bio: string", visibility: "private" },
        ],
        methods: [],
      });
      return {
        nodes: [user, role, profile],
        edges: [
          edge(user.id, role.id, { endArrow: "diamond", label: "* roles" }),
          edge(user.id, profile.id, { endArrow: "triangle", label: "1" }),
        ],
      };
    },
  },
  {
    id: "tpl-ecommerce-db",
    name: "E-commerce Database",
    group: "ER Diagrams",
    kind: "er",
    build() {
      const customer = n("er-entity", 40, 40, "customers", [210, 130], {
        columns: [
          { id: makeId("c"), name: "id", type: "INT", key: "PK" },
          { id: makeId("c"), name: "email", type: "VARCHAR", key: null },
          { id: makeId("c"), name: "name", type: "VARCHAR", key: null },
        ],
      });
      const order = n("er-entity", 340, 40, "orders", [220, 150], {
        columns: [
          { id: makeId("c"), name: "id", type: "INT", key: "PK" },
          { id: makeId("c"), name: "customer_id", type: "INT", key: "FK" },
          { id: makeId("c"), name: "total", type: "DECIMAL", key: null },
          { id: makeId("c"), name: "status", type: "VARCHAR", key: null },
        ],
      });
      const item = n("er-entity", 340, 270, "order_items", [220, 150], {
        columns: [
          { id: makeId("c"), name: "id", type: "INT", key: "PK" },
          { id: makeId("c"), name: "order_id", type: "INT", key: "FK" },
          { id: makeId("c"), name: "product_id", type: "INT", key: "FK" },
          { id: makeId("c"), name: "qty", type: "INT", key: null },
        ],
      });
      const product = n("er-entity", 650, 270, "products", [210, 130], {
        columns: [
          { id: makeId("c"), name: "id", type: "INT", key: "PK" },
          { id: makeId("c"), name: "name", type: "VARCHAR", key: null },
          { id: makeId("c"), name: "price", type: "DECIMAL", key: null },
        ],
      });
      return {
        nodes: [customer, order, item, product],
        edges: [
          edge(customer.id, order.id, { endArrow: "circle", label: "1:N" }),
          edge(order.id, item.id, { endArrow: "circle", label: "1:N" }),
          edge(product.id, item.id, { endArrow: "circle", label: "1:N" }),
        ],
      };
    },
  },
  {
    id: "tpl-blog-db",
    name: "Blog Database",
    group: "ER Diagrams",
    kind: "er",
    build() {
      const users = n("er-entity", 40, 60, "users", [200, 110], {
        columns: [
          { id: makeId("c"), name: "id", type: "INT", key: "PK" },
          { id: makeId("c"), name: "username", type: "VARCHAR", key: null },
        ],
      });
      const posts = n("er-entity", 330, 40, "posts", [220, 150], {
        columns: [
          { id: makeId("c"), name: "id", type: "INT", key: "PK" },
          { id: makeId("c"), name: "author_id", type: "INT", key: "FK" },
          { id: makeId("c"), name: "title", type: "VARCHAR", key: null },
          { id: makeId("c"), name: "body", type: "TEXT", key: null },
        ],
      });
      const comments = n("er-entity", 330, 270, "comments", [220, 130], {
        columns: [
          { id: makeId("c"), name: "id", type: "INT", key: "PK" },
          { id: makeId("c"), name: "post_id", type: "INT", key: "FK" },
          { id: makeId("c"), name: "body", type: "TEXT", key: null },
        ],
      });
      return {
        nodes: [users, posts, comments],
        edges: [
          edge(users.id, posts.id, { endArrow: "circle", label: "writes" }),
          edge(posts.id, comments.id, { endArrow: "circle", label: "has" }),
        ],
      };
    },
  },
  {
    id: "tpl-mindmap",
    name: "Project Planning",
    group: "Mind Maps",
    kind: "mindmap",
    build() {
      const center = n("ellipse", 360, 220, "Project", [150, 70]);
      const a = n("rounded-rectangle", 120, 60, "Research", [130, 56]);
      const b = n("rounded-rectangle", 120, 360, "Design", [130, 56]);
      const c = n("rounded-rectangle", 640, 60, "Build", [130, 56]);
      const d = n("rounded-rectangle", 640, 360, "Launch", [130, 56]);
      a.data.style.stroke = "#2563eb";
      b.data.style.stroke = "#9333ea";
      c.data.style.stroke = "#16a34a";
      d.data.style.stroke = "#ea580c";
      return {
        nodes: [center, a, b, c, d],
        edges: [
          edge(center.id, a.id, { routing: "default", endArrow: "none" }),
          edge(center.id, b.id, { routing: "default", endArrow: "none" }),
          edge(center.id, c.id, { routing: "default", endArrow: "none" }),
          edge(center.id, d.id, { routing: "default", endArrow: "none" }),
        ],
      };
    },
  },
  {
    id: "tpl-network",
    name: "Office Network",
    group: "Network",
    kind: "network",
    build() {
      const cloud = n("cloud-network", 360, 0, "Internet", [150, 90]);
      const fw = n("firewall", 375, 130, "Firewall", [90, 80]);
      const router = n("router", 375, 250, "Router", [90, 80]);
      const sw = n("switch", 375, 370, "Switch", [90, 80]);
      const s1 = n("server", 200, 490, "Server", [90, 80]);
      const c1 = n("client-device", 360, 490, "PC 1", [90, 80]);
      const c2 = n("client-device", 520, 490, "PC 2", [90, 80]);
      return {
        nodes: [cloud, fw, router, sw, s1, c1, c2],
        edges: [
          edge(cloud.id, fw.id, { endArrow: "none" }),
          edge(fw.id, router.id, { endArrow: "none" }),
          edge(router.id, sw.id, { endArrow: "none" }),
          edge(sw.id, s1.id, { endArrow: "none" }),
          edge(sw.id, c1.id, { endArrow: "none" }),
          edge(sw.id, c2.id, { endArrow: "none" }),
        ],
      };
    },
  },
];

export const TEMPLATE_GROUPS = Array.from(
  new Set(TEMPLATES.map((t) => t.group)),
);

import "./collage.css";
import { useReveal } from "../../hooks/useReveal.js";

// Placeholder line-art standing in for real product/site photography the
// client will supply later — each tile below can become a plain <img> then.
const DropletIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path
            d="M12 2.5s7 8.2 7 12.8a7 7 0 1 1-14 0c0-4.6 7-12.8 7-12.8z"
            strokeLinejoin="round"
        />
    </svg>
);

const SprinklerIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path
            d="M12 22v-9M8 22h8M12 13a4 4 0 0 0 4-4c0-2-2-3-4-6-2 3-4 4-4 6a4 4 0 0 0 4 4z"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M3 6c2 1 3 2.5 3 4M21 6c-2 1-3 2.5-3 4"
            strokeLinecap="round"
        />
    </svg>
);

const TractorIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <circle cx="6" cy="17" r="3" />
        <circle cx="17" cy="17" r="4.5" />
        <path
            d="M6 14V7h5l4 4h3v3M9 7V4h6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const WaveIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path
            d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
            strokeLinecap="round"
        />
    </svg>
);

const PipeIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path
            d="M4 6h6a4 4 0 0 1 4 4v4a4 4 0 0 0 4 4h2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="4" cy="6" r="1.5" />
        <circle cx="20" cy="18" r="1.5" />
    </svg>
);

const TankIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path
            d="M4 8c0-2 3.5-3.5 8-3.5S20 6 20 8v8c0 2-3.5 3.5-8 3.5S4 18 4 16V8z"
            strokeLinejoin="round"
        />
        <path d="M4 8c0 2 3.5 3.5 8 3.5S20 10 20 8" strokeLinecap="round" />
    </svg>
);

const ValveIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FieldIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        <path
            d="M6 6c1.5 2 1.5 4 0 6M12 6c1.5 2 1.5 4 0 6M18 6c1.5 2 1.5 4 0 6"
            strokeLinecap="round"
        />
    </svg>
);

const tiles = [
    {
        icon: DropletIcon,
        label: "Irrigation",
        tone: "collage__tile--primary",
        size: "collage__tile--large",
    },
    {
        icon: SprinklerIcon,
        label: "Sprinkler Systems",
        tone: "collage__tile--accent",
        size: "collage__tile--small",
    },
    {
        icon: TractorIcon,
        label: "Equipment",
        tone: "collage__tile--light",
        size: "collage__tile--small",
    },
    {
        icon: WaveIcon,
        label: "Dam Liners",
        tone: "collage__tile--dark",
        size: "collage__tile--wide",
    },
    {
        icon: PipeIcon,
        label: "Water Supply",
        tone: "collage__tile--light",
        size: "collage__tile--small",
    },
    {
        icon: TankIcon,
        label: "Water Storage",
        tone: "collage__tile--accent",
        size: "collage__tile--small",
    },
    {
        icon: FieldIcon,
        label: "Farmland",
        tone: "collage__tile--primary",
        size: "collage__tile--wide",
    },
];

function Collage() {
    const { ref, revealClass } = useReveal();

    return (
        <section className="collage">
            <div ref={ref} className={`collage__grid ${revealClass}`}>
                {tiles.map(({ icon: Icon, label, tone, size }) => (
                    <div
                        key={label}
                        className={`collage__tile ${tone} ${size}`}
                    >
                        <Icon />
                        <span className="collage__tile-label">{label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Collage;

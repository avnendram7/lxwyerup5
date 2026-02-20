import React, { useEffect, useRef } from 'react';

const ParticleBackground = ({ darkMode }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Guard clause

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init(); // Re-init on resize to adjust density
        };

        window.addEventListener('resize', resizeCanvas);

        // Initial size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.8; // Slightly faster
                this.vy = (Math.random() - 0.5) * 0.8;
                this.size = Math.random() * 3 + 1.5; // Larger: 1.5 to 4.5
                this.color = darkMode
                    ? `rgba(56, 189, 248, ${Math.random() * 0.5 + 0.3})` // Light blue (sky-400) for dark mode
                    : `rgba(30, 58, 138, ${Math.random() * 0.4 + 0.2})`;   // Dark blue (blue-900) for light mode
            }

            update(mouseX, mouseY) {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200; // Larger interaction radius

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    // Gentle push away
                    const directionX = forceDirectionX * force * 0.8;
                    const directionY = forceDirectionY * force * 0.8;

                    this.vx -= directionX;
                    this.vy -= directionY;
                }

                // Friction
                this.vx *= 0.99;
                this.vy *= 0.99;

                // Minimum movement to keep them floating
                if (Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.1;
                if (Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            // Adjust density: 1 particle per 9000px sq
            const numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
            console.log('Particles initialized:', numberOfParticles);
        };

        let mouse = { x: null, y: null };

        const handleMouseMove = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const connectParticles = () => {
            let maxDistance = 120; // Longer connections
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        ctx.strokeStyle = darkMode
                            ? `rgba(56, 189, 248, ${0.5 * (1 - distance / maxDistance)})` // Light blue lines
                            : `rgba(30, 58, 138, ${0.2 * (1 - distance / maxDistance)})`;  // Dark blue lines
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear

            particles.forEach(particle => {
                particle.update(mouse.x, mouse.y);
                particle.draw();
            });

            connectParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [darkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{
                position: 'absolute', // Ensures it stays within relative parent
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0, // Explicitly behind content (which is z-10)
                background: 'transparent'
            }}
        />
    );
};

export default ParticleBackground;

import { useCallback } from 'react';

export const useAddToCartAnimation = () => {
    const animate = useCallback((imageUrl, startElement) => {
        if (!imageUrl) return;

        // Create the flying image element
        const flyingImage = document.createElement('img');
        flyingImage.src = imageUrl;
        flyingImage.style.position = 'fixed';
        flyingImage.style.zIndex = '9999';
        flyingImage.style.pointerEvents = 'none';
        flyingImage.style.borderRadius = '50%';
        flyingImage.style.objectFit = 'cover';
        flyingImage.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        flyingImage.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';

        // Get starting position
        // If startElement is provided (ref or element), use it. 
        // Otherwise, it might be a click event, so use clientX/clientY as fallback or try to find an image nearby.
        let startRect;
        if (startElement instanceof HTMLElement) {
            // Try to find the main product image inside the startElement if it's a container
            const imgInside = startElement.querySelector('img');
            const target = imgInside || startElement;
            startRect = target.getBoundingClientRect();
        } else if (startElement?.currentTarget) {
            // If it's an event
            const target = startElement.currentTarget;
            // Try to find an image in the parent card or nearby
            const card = target.closest('.group') || target.closest('div');
            const img = card?.querySelector('img');
            startRect = img ? img.getBoundingClientRect() : target.getBoundingClientRect();
        } else {
            return; // Cannot determine start position
        }

        flyingImage.style.left = `${startRect.left}px`;
        flyingImage.style.top = `${startRect.top}px`;
        flyingImage.style.width = `${startRect.width}px`;
        flyingImage.style.height = `${startRect.height}px`;
        flyingImage.style.opacity = '0.8';

        document.body.appendChild(flyingImage);

        // Force reflow
        void flyingImage.offsetWidth;

        // Get target position (cart icon)
        const cartIcon = document.getElementById('cart-icon-container');
        if (!cartIcon) {
            console.warn('Cart icon target not found');
            document.body.removeChild(flyingImage);
            return;
        }

        const cartRect = cartIcon.getBoundingClientRect();

        // Animate to target
        flyingImage.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`; // Center horizontally minus half width (30px/2)
        flyingImage.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;  // Center vertically
        flyingImage.style.width = '30px';
        flyingImage.style.height = '30px';
        flyingImage.style.opacity = '0'; // Fade out at the end

        // Cleanup
        setTimeout(() => {
            if (document.body.contains(flyingImage)) {
                document.body.removeChild(flyingImage);
            }

            // Optional: Trigger a small "bump" animation on the cart icon itself
            if (cartIcon) {
                cartIcon.style.transform = 'scale(1.2)';
                cartIcon.style.transition = 'transform 0.2s ease';
                setTimeout(() => {
                    cartIcon.style.transform = 'scale(1)';
                }, 200);
            }
        }, 800);
    }, []);

    return { animate };
};

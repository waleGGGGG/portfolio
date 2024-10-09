(() => {
    "use strict";
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    class DynamicAdapt {
        constructor(type) {
            this.type = type;
        }
        init() {
            this.оbjects = [];
            this.daClassname = "_dynamic_adapt_";
            this.nodes = [ ...document.querySelectorAll("[data-da]") ];
            this.nodes.forEach((node => {
                const data = node.dataset.da.trim();
                const dataArray = data.split(",");
                const оbject = {};
                оbject.element = node;
                оbject.parent = node.parentNode;
                оbject.destination = document.querySelector(`${dataArray[0].trim()}`);
                оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767.98";
                оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
                оbject.index = this.indexInParent(оbject.parent, оbject.element);
                this.оbjects.push(оbject);
            }));
            this.arraySort(this.оbjects);
            this.mediaQueries = this.оbjects.map((({breakpoint}) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`)).filter(((item, index, self) => self.indexOf(item) === index));
            this.mediaQueries.forEach((media => {
                const mediaSplit = media.split(",");
                const matchMedia = window.matchMedia(mediaSplit[0]);
                const mediaBreakpoint = mediaSplit[1];
                const оbjectsFilter = this.оbjects.filter((({breakpoint}) => breakpoint === mediaBreakpoint));
                matchMedia.addEventListener("change", (() => {
                    this.mediaHandler(matchMedia, оbjectsFilter);
                }));
                this.mediaHandler(matchMedia, оbjectsFilter);
            }));
        }
        mediaHandler(matchMedia, оbjects) {
            if (matchMedia.matches) оbjects.forEach((оbject => {
                this.moveTo(оbject.place, оbject.element, оbject.destination);
            })); else оbjects.forEach((({parent, element, index}) => {
                if (element.classList.contains(this.daClassname)) this.moveBack(parent, element, index);
            }));
        }
        moveTo(place, element, destination) {
            element.classList.add(this.daClassname);
            if (place === "last" || place >= destination.children.length) {
                destination.append(element);
                return;
            }
            if (place === "first") {
                destination.prepend(element);
                return;
            }
            destination.children[place].before(element);
        }
        moveBack(parent, element, index) {
            element.classList.remove(this.daClassname);
            if (parent.children[index] !== void 0) parent.children[index].before(element); else parent.append(element);
        }
        indexInParent(parent, element) {
            return [ ...parent.children ].indexOf(element);
        }
        arraySort(arr) {
            if (this.type === "min") arr.sort(((a, b) => {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) return 0;
                    if (a.place === "first" || b.place === "last") return -1;
                    if (a.place === "last" || b.place === "first") return 1;
                    return 0;
                }
                return a.breakpoint - b.breakpoint;
            })); else {
                arr.sort(((a, b) => {
                    if (a.breakpoint === b.breakpoint) {
                        if (a.place === b.place) return 0;
                        if (a.place === "first" || b.place === "last") return 1;
                        if (a.place === "last" || b.place === "first") return -1;
                        return 0;
                    }
                    return b.breakpoint - a.breakpoint;
                }));
                return;
            }
        }
    }
    const da = new DynamicAdapt("max");
    da.init();
    document.addEventListener("DOMContentLoaded", (function() {
        const menuButton = document.querySelector(".header__menu-button");
        const navigation = document.querySelector(".header__navigation");
        const menuLinks = document.querySelectorAll(".header__navigation a");
        const overlay = document.createElement("div");
        overlay.classList.add("page-overlay");
        document.body.appendChild(overlay);
        function disableScroll() {
            document.body.classList.add("no-scroll");
            document.addEventListener("touchmove", preventScroll, {
                passive: false
            });
        }
        function enableScroll() {
            document.body.classList.remove("no-scroll");
            document.removeEventListener("touchmove", preventScroll);
        }
        function preventScroll(event) {
            event.preventDefault();
        }
        menuButton.addEventListener("click", (function(event) {
            event.stopPropagation();
            navigation.classList.toggle("active");
            overlay.classList.toggle("active");
            if (navigation.classList.contains("active")) disableScroll(); else enableScroll();
        }));
        overlay.addEventListener("click", (function() {
            navigation.classList.remove("active");
            overlay.classList.remove("active");
            enableScroll();
        }));
        document.addEventListener("click", (function(event) {
            if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
                navigation.classList.remove("active");
                overlay.classList.remove("active");
                enableScroll();
            }
        }));
        menuLinks.forEach((link => {
            link.addEventListener("click", (function() {
                navigation.classList.remove("active");
                overlay.classList.remove("active");
                enableScroll();
            }));
        }));
    }));
    document.querySelectorAll(".filter-list__input").forEach((input => {
        input.addEventListener("change", (() => {
            const filter = input.parentElement.getAttribute("data-filter");
            const products = document.querySelectorAll(".portfolio__card");
            products.forEach((product => {
                if (filter === "all") product.style.display = "block"; else if (product.classList.contains(filter)) product.style.display = "block"; else product.style.display = "none";
            }));
        }));
    }));
    document.querySelector('[data-filter="all"] input').click();
    function showMessage(message, type) {
        const messageBox = document.createElement("p");
        messageBox.classList.add("footer__subscription-message");
        messageBox.textContent = message;
        if (type === "success") messageBox.classList.add("footer__subscription-message--success"); else messageBox.classList.add("footer__subscription-message--error");
        const existingMessage = document.querySelector(".footer__subscription-message");
        if (existingMessage) existingMessage.remove();
        document.querySelector(".footer__subscription-form").prepend(messageBox);
        setTimeout((() => {
            messageBox.classList.add("fade-out");
            messageBox.addEventListener("transitionend", (() => {
                messageBox.remove();
            }));
        }), 2e3);
    }
    document.getElementById("subscriptionForm").addEventListener("submit", (function(event) {
        event.preventDefault();
        const emailInput = document.getElementById("email");
        const emailValue = emailInput.value.trim();
        if (!emailValue) showMessage("Email field cannot be empty", "error"); else if (!validateEmail(emailValue)) showMessage("Email is not valid", "error"); else showMessage("Thank you for subscribing to our newsletter!", "success");
    }));
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    document.getElementById("email").addEventListener("focus", (function() {
        this.placeholder = "";
    }));
    document.getElementById("email").addEventListener("blur", (function() {
        this.placeholder = "Email Address";
    }));
    document.addEventListener("click", (function(event) {
        const form = document.querySelector(".footer__subscription-form");
        const emailInput = document.getElementById("email");
        if (!form.contains(event.target) && emailInput.value) {
            emailInput.value = "";
            emailInput.placeholder = "Email Address";
        }
    }));
    document.querySelectorAll('[class*="scroll-button-inner"] [class*="__scroll-but"]').forEach((button => {
        button.addEventListener("click", (function() {
            const currentSection = this.closest("section");
            const nextSection = currentSection.nextElementSibling;
            if (nextSection) {
                const headerHeight = document.querySelector("header").offsetHeight;
                const scrollToPosition = nextSection.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: "smooth"
                });
            }
        }));
    }));
    window["FLS"] = true;
})();
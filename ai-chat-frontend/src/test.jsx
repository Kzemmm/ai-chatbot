<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blackbox AI Style UI</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <header>
        <div class="header-right">
            <div class="avatar"></div>
        </div>
    </header>

    <div class="sidebar" id="sidebar">
        <button class="toggle-btn" onclick="toggleSidebar()">☰</button>
        <div class="sidebar-content">
            <h2>New Chat</h2>
            <h2>History</h2>
            <div class="sidebar-bottom">
                <div class="avatar"></div>
            </div>
        </div>
    </div>

    <main id="main">
        <div class="chat-area">
            <div class="message bot">Hello! How can I help you?</div>
            <div class="message user">Tell me about AI.</div>
        </div>
        <div class="chat-input">
            <input type="text" placeholder="Type your message...">
            <button>Send</button>
        </div>
    </main>

    <script>
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('collapsed');
        }
    </script>

</body>
</html>

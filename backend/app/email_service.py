def send_verification_email_dev(
    email: str,
    verification_url: str,
) -> None:
    print()
    print("=" * 72)
    print("DEV EMAIL: подтверждение электронной почты")
    print(f"Получатель: {email}")
    print("Открой ссылку:")
    print(verification_url)
    print("=" * 72)
    print()
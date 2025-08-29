import os
from infer_doc_sem import predict

# ---------- policy rules ----------
def apply_policy(pred):
    """
    Given model predictions, decide what info is missing
    and generate human-like chatbot response.
    """
    doc_type = pred["doc_type"]
    sem = pred["semester"]

    # Response builder
    response = []

    if doc_type == "OTR":
        response.append("Got it 👍 You’re requesting an Official Transcript of Records (OTR).")
        response.append("For OTR, I don’t need semester or school year details.")
        response.append("Once your payment is confirmed and faculty approves, the registrar will process it. You’ll be able to claim it the next working day.")
    
    elif doc_type == "COG":
        response.append("Sure 👍 That’s a Certificate of Grades (COG).")
        if sem == 0:
            response.append("I’ll just need to know which **semester** and **school year** this is for.")
        else:
            response.append(f"I’ve noted Semester {sem}. I’ll also need the **school year** (e.g., 2025-2026).")
        response.append("After payment and faculty approval, your document will be ready the next working day.")

    elif doc_type == "COE":
        response.append("Alright 👍 You’re requesting a Certificate of Enrollment (COE).")
        if sem == 0:
            response.append("I’ll need the **semester** and **school year**.")
        else:
            response.append(f"Got it for Semester {sem}. Please provide the **school year** (e.g., 2025-2026).")
        response.append("For COE, I’ll also need some personal details: full name, birthdate, exact address, and place of birth.")
        response.append("Once payment is confirmed and faculty approves, your COE will be released the next working day.")

    else:  # OTHERS
        response.append("Got it 👍 You’re requesting a document outside the standard list (OTR, COG, COE).")
        response.append("Could you specify exactly what document you need?")
        response.append("Once I have the details, the same process applies: request → payment → approval → release the next working day.")

    return "\n".join(response)


# ---------- chat loop ----------
def chat():
    print("📚 RegistrarConnect Chatbot (type 'quit' to exit)")
    while True:
        user_input = input("> ").strip()
        if user_input.lower() in {"quit", "exit"}:
            print("👋 Goodbye!")
            break

        # Run through predictor
        pred = predict(user_input)
        # Apply rules
        reply = apply_policy(pred)

        print(reply)
        print("-" * 80)


if __name__ == "__main__":
    chat()

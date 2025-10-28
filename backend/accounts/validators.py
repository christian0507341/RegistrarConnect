# accounts/validators.py
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator

# --- Username: no spaces (used on the model) ---
no_space_username_validator = RegexValidator(
    regex=r"^\S+$",
    message=_("Username cannot contain spaces."),
)

# --- Email: must end with .up@phinmaed.com ---
def validate_phinma_email(value: str):
    # case-insensitive; requires something like name.surname.up@phinmaed.com
    if not re.search(r"\.up@phinmaed\.com\Z", value, flags=re.IGNORECASE):
        raise ValidationError(_("Email must be a PHINMA address ending with '.up@phinmaed.com'."))

# --- Student ID: 03-2324-092300 or 03-01-2425-329623 ---
STUDENT_ID_PATTERNS = [
    r"^\d{2}-\d{4}-\d{6}$",      # XX-XXXX-XXXXXX
    r"^\d{2}-\d{2}-\d{4}-\d{6}$" # XX-XX-XXXX-XXXXXX
]

def validate_student_id(value: str):
    for pat in STUDENT_ID_PATTERNS:
        if re.match(pat, value):
            return
    raise ValidationError(_("Student ID format must be 'XX-XXXX-XXXXXX' or 'XX-XX-XXXX-XXXXXX'."))

# --- Password validators (add in settings AUTH_PASSWORD_VALIDATORS) ---
class NoSpacesPasswordValidator:
    def validate(self, password, user=None):
        if " " in password:
            raise ValidationError(_("Password cannot contain spaces."))

    def get_help_text(self):
        return _("Your password cannot contain spaces.")

class UppercaseAndDigitValidator:
    def validate(self, password, user=None):
        if not re.search(r"[A-Z]", password):
            raise ValidationError(_("Password must contain at least one uppercase letter (A–Z)."))
        if not re.search(r"\d", password):
            raise ValidationError(_("Password must contain at least one number (0–9)."))

    def get_help_text(self):
        return _("Your password must contain at least one uppercase letter and one number.")

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3d6f72ef097e"
down_revision = "68c023a50737"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # add columns if not exists
    op.execute(
        "ALTER TABLE providers ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8);"
    )
    op.execute(
        "ALTER TABLE providers ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8);"
    )

    # create index if not exists (Postgres supports this)
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_provider_coordinates ON providers(latitude, longitude);"
    )

    # populate coordinates for known locations (use users.id)
    op.execute(
        """
        -- Panaji / Panjim
        UPDATE providers p
        SET latitude = 15.4909, longitude = 73.8278
        FROM users u
        WHERE p.user_id = u.id AND (u.location ILIKE '%panaji%' OR u.location ILIKE '%panjim%');
        """
    )
    op.execute(
        """
        -- Margao / Madgaon
        UPDATE providers p
        SET latitude = 15.2832, longitude = 73.9667
        FROM users u
        WHERE p.user_id = u.id AND (u.location ILIKE '%margao%' OR u.location ILIKE '%madgaon%');
        """
    )
    op.execute(
        """
        -- Calangute
        UPDATE providers p
        SET latitude = 15.5439, longitude = 73.7553
        FROM users u
        WHERE p.user_id = u.id AND (u.location ILIKE '%calangute%');
        """
    )
    op.execute(
        """
        -- Mapusa
        UPDATE providers p
        SET latitude = 15.5911, longitude = 73.8077
        FROM users u
        WHERE p.user_id = u.id AND (u.location ILIKE '%mapusa%');
        """
    )
    op.execute(
        """
        -- Vasco da Gama
        UPDATE providers p
        SET latitude = 15.3989, longitude = 73.8151
        FROM users u
        WHERE p.user_id = u.id AND (u.location ILIKE '%vasco%');
        """
    )
    op.execute(
        """
        -- Baga
        UPDATE providers p
        SET latitude = 15.5560, longitude = 73.7516
        FROM users u
        WHERE p.user_id = u.id AND (u.location ILIKE '%baga%');
        """
    )

    # default center of Goa for remaining NULLs
    op.execute(
        """
        UPDATE providers
        SET latitude = 15.2993, longitude = 74.1240
        WHERE latitude IS NULL OR longitude IS NULL;
        """
    )


def downgrade() -> None:
    # optionally clear coordinates (not strictly required)
    op.execute("UPDATE providers SET latitude = NULL, longitude = NULL;")
    op.execute("DROP INDEX IF EXISTS idx_provider_coordinates;")
    op.execute("ALTER TABLE providers DROP COLUMN IF EXISTS longitude;")
    op.execute("ALTER TABLE providers DROP COLUMN IF EXISTS latitude;")